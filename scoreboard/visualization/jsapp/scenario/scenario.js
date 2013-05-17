/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.ScenarioChartView = Backbone.View.extend({

    className: 'highcharts-chart',

    initialize: function(options) {
        this.data_revision = options['data_revision'] || '';
        this.cube_url = options['cube_url'];
        this.model.on('change', this.load_chart, this);
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.loadstate.on('change', this.load_chart, this);
        this.schema = options['schema'];
        this.scenario_chart = options['scenario_chart'];
        this.multidim_value = [];
        this.dimensions_mapping = {};
        this.multiple_series = options['schema']['multiple_series'];
        this.client_filter = null;
        _(options.filters_schema).forEach(function(facet) {
            this.dimensions_mapping[facet['name']] = facet['dimension'];
            if(facet['name'] == this.schema['category_facet']) {
                this.client_filter = facet['name'];
            }
        }, this);
        _(options.values_schema).forEach(function(facet) {
            if(facet['multidim_value']) {
                this.multidim_value.push(facet['dimension']);
            }
        }, this);
        this.requests_in_flight = [];
        this.load_chart();
    },

    render: function() {
        if(this.data) {
            this.scenario_chart(this.el, this.data, this.data.meta_data);
        }
    },

    get_meta_data: function(chart_data){
        var meta_data = {};
        chart_data['meta_data'] = meta_data;
        var requests = [];

        _(this.schema['labels']).forEach(function(label_spec, label_name) {
            var args = {
                'dimension': this.dimensions_mapping[label_spec['facet']],
                'value': this.model.get(label_spec['facet']),
                'rev': this.data_revision
            };
            var ajax = $.getJSON(this.cube_url + '/dimension_labels', args);
            ajax.done(function(data) {
                meta_data[label_name] = data[label_spec['field']];
            });
            requests.push(ajax);
        }, this);

        return requests;
    },

    request_datapoints: function(url, args){
        var relevant_args = {}
        _(args).each(function(value, key){
            if (value!='any'){
                var pair = _.object([[key, value]]);
                _(relevant_args).extend(pair);
            }
        });
        relevant_args = _({rev: this.data_revision}).extend(relevant_args);
        return $.getJSON(url, relevant_args);
    },

    load_chart: function() {
        _(this.requests_in_flight).forEach(function(req) { req.abort(); });
        this.requests_in_flight = [];
        var incomplete = false;
        var args = {};
        var requests = [];
        _(this.dimensions_mapping).each(function(dimension, filter_name) {
            if(filter_name != this.multiple_series &&
               filter_name != this.client_filter) {
                args[filter_name] = this.model.get(filter_name);
                if(! args[filter_name]) { incomplete = true; }
            }
            if(this.loadstate.get(filter_name)) { incomplete = true; }
        }, this);
        if(incomplete) {
            // not all filters have values
            this.$el.html('--');
            return;
        }
        this.$el.html('-- loading --');
        var unit_is_pc = [];
        if(this.schema['multidim'] == 3){
            args['join_by'] = this.schema.category_facet;
            var units = [this.model.get('x-unit-measure') || '',
                         this.model.get('y-unit-measure') || '',
                         this.model.get('z-unit-measure') || '']
            _(units).each(function(unit){
                var evaluation = false
                if (unit.substring(0,3) == 'pc_'){
                    evaluation = true;
                }
                unit_is_pc.push(evaluation);
            });
        }
        else if(this.schema['multidim'] == 2){
            args['join_by'] = this.schema.category_facet;
            var units = [this.model.get('x-unit-measure') || '',
                         this.model.get('y-unit-measure') || '']
            _(units).each(function(unit){
                var evaluation = false
                if (unit.substring(0,3) == 'pc_'){
                    evaluation = true;
                }
                unit_is_pc.push(evaluation);
            });
        }
        else{
            var unit = this.model.get('unit-measure') || '';
            if (unit.substring(0,3) == 'pc_'){
                unit_is_pc.push(true);
            }
        }
        // category_facet, value and unit-measure always in tooltip
        var tooltip_attributes = ['value', 'unit-measure'];;
        if ( this.schema['tooltips'] ) {
            tooltip_attributes = tooltip_attributes.concat(_.keys(this.schema['tooltips']));
        }
        var category_facet = this.schema.category_facet;
        if (this.multiple_series) {
            tooltip_attributes.push(this.multiple_series);
        }
        var multidim = this.schema['multidim'];
        var chart_data = {
            'tooltip_formatter': function() {
                var attrs = this.point.attributes;
                var out = '<b>' + attrs[category_facet].label + '</b>';
                // point value(s) and unit-measure
                if (_.contains(tooltip_attributes, 'value')) {
                    if ( multidim ) {
                        out += '<br><b>x</b>: ' + Math.round(this.x*10)/10 + ' ';
                        if (_.contains(tooltip_attributes, 'unit-measure')) {
                            out += attrs['unit-measure']['x'].label;
                        }
                    }
                    out += '<br><b>y</b>: ' + Math.round(this.y*10)/10 + ' ';
                    if (_.contains(tooltip_attributes, 'unit-measure')) {
                        if ( multidim ) {
                            out += attrs['unit-measure']['y'].label;
                        } else {
                            out += attrs['unit-measure'].label;
                        }
                    }
                    if ( multidim == 3 ) {
                        out += '<br><b>z</b>: ' + Math.round(this.point.z*10)/10 + ' ';
                        if (_.contains(tooltip_attributes, 'unit-measure')) {
                            out += attrs['unit-measure']['z'].label;
                        }
                    }
                }
                // additional attributes
                _(_.without(tooltip_attributes, 'value', 'unit-measure')).each(function(attr) {
                    if ( multidim ) {
                        var dims = ['x', 'y'];
                        if ( multidim == 3 ) {
                            dims.push('z');
                        }
                        _.each(dims, function(dim) {
                            if ( attrs[attr] && typeof attrs[attr][dim] != "undefined" && attrs[attr][dim]) {
                                // values per dim
                                if ( typeof attrs[attr][dim].label != "undefined" && attrs[attr][dim].label ) {
                                    out += '<br><b>' + attr + '-' + dim + '</b>: ' + attrs[attr][dim].label;
                                } else {
                                    out += '<br><b>' + attr + '-' + dim + '</b>: ' + attrs[attr][dim];
                                }
                            } else if ( attrs[attr] && typeof attrs[attr][dim] == "undefined" ) {
                                // common values for all dims
                                if ( dim === dims[0] && typeof attrs[attr].label != "undefined" && attrs[attr].label ) {
                                        out += '<br><b>' + attr + '</b>: ' + attrs[attr].label;
                                }
                                return;
                            }
                        });
                    } else {
                        if ( attrs[attr] && typeof attrs[attr].label != "undefined" ) {
                            if ( attrs[attr].label != null ) {
                                out += '<br><b>' + attr + '</b>: ' + attrs[attr].label;
                            }
                        } else if ( attrs[attr] ) {
                            if ( attrs[attr] != null ) {
                                out += '<br><b>' + attr + '</b>: ' + attrs[attr];
                            }
                        }
                    }
                });                
                
                return out;
            },
            'credits': {
                'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                'text': 'European Commission, Digital Agenda Scoreboard'
            },
            'xlabels_formatter': function() {
                var max_length = 15;
                if (this.value.length > max_length){
                    return this.value.substr(0, max_length) + ' ...';
                }
                return this.value;
            },
            'group_labels': {},
            'unit_is_pc': unit_is_pc,
            'plotlines': this.schema['plotlines'] || false,
            'animation': this.schema['animation'] || false,
            'legend': this.schema['legend'] || false,
            'multiseries': this.multiple_series,
            'category_facet': this.schema['category_facet'],
            'subtype': this.schema.chart_subtype,
            'sort': this.schema['sort']
        };

        var multiseries_values = null;
        var data_method = '';
        if (this.schema['multidim'] == 3) {
            data_method = '/datapoints_xyz';
        }
        else if (this.schema['multidim'] == 2) {
            data_method = '/datapoints_xy';
        }
        else if(this.schema['chart_type'] === 'country_profile'){
            args.subtype = this.schema['chart_subtype'];
            data_method = '/datapoints_cp';
        }
        else {
            data_method = '/datapoints';
        }
        var datapoints_url = this.cube_url + data_method;

        if (this.multiple_series) {
            var groupby_dimension = this.dimensions_mapping[
                this.multiple_series];
            multiseries_values = this.model.get(this.multiple_series);
            requests = _(multiseries_values).map(function(value) {
                args[groupby_dimension] = value;
                return this.request_datapoints(datapoints_url, args);
            }, this);
            var groupby_facet = _(this.schema.facets).find(function(facet, idx){
                return facet['name'] == groupby_dimension;
            });
            var labels_args = {
                'dimension': groupby_dimension,
                'rev': this.data_revision
            };
            if (groupby_facet){
                _.chain(groupby_facet.constraints)
                 .values()
                 .each(function(facet){
                    _(labels_args).extend(
                        _.object([
                            [facet, this.model.get(facet)]
                        ])
                    );
                }, this);
            }
            var labels_request = $.getJSON(this.cube_url + '/dimension_options',
                                       labels_args);
            labels_request.done(function(data) {
                var results = data['options'];
                chart_data['group_labels'] = _.object(
                    _(results).pluck('notation'),
                    _(results).pluck('label'));
            });
            requests.push(labels_request);
        }
        else {
            multiseries_values = [null];
            requests.push(this.request_datapoints(datapoints_url, args));
        }

        var client_filter_options = [];
        if(this.client_filter) {
            client_filter_options = this.model.get(this.client_filter);
        }

        _(this.get_meta_data(chart_data)).forEach(function(req) {
            requests.push(req);
        });

        this.requests_in_flight = requests;

        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(_.bind(function() {
            var responses = _(arguments).toArray();
            if(requests.length < 2) { responses = [responses]; }

            chart_data['series'] = _(multiseries_values).map(function(value, n) {
                //TODO resp should always have the same keys
                var resp = responses[n];
                var datapoints = resp[0]['datapoints'];
                if(this.client_filter) {
                    var dimension = this.dimensions_mapping[this.client_filter];
                    datapoints = _(datapoints).filter(function(item) {
                        return _(client_filter_options).contains(
                            item[dimension]['notation']);
                    }, this);
                }
                return {
                    'label': chart_data['group_labels'][value],
                    'data': datapoints
                };
            }, this);
            this.data = chart_data;
            this.render();
        }, this));
    }

});


App.GraphControlsView = Backbone.View.extend({

    template: App.get_template('scenario/graph_controls.html'),

    events: {
        'click #toolbar #prev': 'on_prev',
        'click #toolbar #play': 'on_auto_change',
        'click #toolbar #next': 'on_next',
    },

    initialize: function(options) {
        this.chart = options['chart']
        _(this.chart).extend(Backbone.Events);
        this.snapshots_data = options['snapshots_data'];
        this.range = options['range'];
        this.interval = options['interval'];
        this.model.on('change', this.render, this);
        this.model.set({'value': 0, 'auto': false});
        this.multiseries = options['multiseries'] || false;
        this.plotlines = options['plotlines'] || false;
        this.chart_type = options['chart_type'];
        this.sort = options['sort'];
    },

    update_plotlines: function(new_data){
         if (! this.multiseries){
             new_data = [new_data];
         }
         App.add_plotLines(this.chart, new_data, this.chart_type);
    },

    update_chart: function(){
        var new_data = this.snapshots_data[this.model.get('value')];
        _(this.chart.series).each(function(serie, serie_idx){
            _(serie['data']).each(function(item, item_idx){
                var point_data = null;
                if (this.multiseries) {
                    point_data = new_data[serie_idx]['data'][item_idx];
                }
                else {
                    point_data = new_data['data'][item_idx];
                }
                item.update(point_data,
                            false,
                            {duration: 950, easing: 'linear'});
            }, this);
        }, this);
        if (this.plotlines){
            this.update_plotlines(new_data);
        }
        if (this.sort.retain_first_serie_order){
            this.chart.xAxis[0].categories =  _(this.snapshots_data[0]['data']).pluck('name');
        }
        else{
            this.chart.xAxis[0].categories =  _(new_data['data']).pluck('name');
        };
        this.chart.redraw();
        this.chart.setTitle(null, {text: new_data['name']});
    },

    on_next: function(){
        var current_value = this.model.get('value');
        var max = this.snapshots_data.length - 1;
        var next_value = current_value + 1;
        if (next_value > max){
            next_value = 0;
        }
        this.model.set('value', next_value);
        this.update_chart();
    },

    on_prev: function(){
        var current_value = this.model.get('value');
        var max = this.snapshots_data.length - 1;
        var next_value = current_value - 1;
        if (next_value < 0){
            next_value = max;
        }
        this.model.set('value', next_value);
        this.update_chart();
    },

    on_auto_change: function() {
        var prev = this.model.get('auto');
        var options = this.model.attributes;
        this.model.set('auto', !prev);
        if (prev){
            clearInterval(this.interval);
        }
        else{
            this.interval = setInterval(_.bind(function(){
                var idx = options['value']
                var chart = this.chart;
                if (idx < this.snapshots_data.length){
                    var data = this.snapshots_data[idx];
                    this.update_chart();
                    options['value']+=1;
                }
                else{
                    options['auto'] = false;
                    clearInterval(this.interval);
                    options['value'] = 0;
                    this.model.set(options);
                    this.render();
                }
            }, this), 1000);
        }
    },

    render: function() {
        this.$el.html(this.template(
            { 'auto': this.model.get('auto') }
        ));
        App.plone_jQuery( "#year" ).val( App.plone_jQuery( "#slider" ).slider( "value" ) );
        if (this.model.get('auto')){
            App.plone_jQuery( "#slider" ).slider('disable');
        }
        var prev = this.$el.find('#prev');
        var play = this.$el.find('#play');
        var next = this.$el.find('#next');
        App.plone_jQuery(prev).button({
            text: false,
            icons: {
                primary: "ui-icon-seek-start"
            }
        });
        var auto_icon = '';
        if (this.model.get('auto')){
            auto_icon = "ui-icon-pause";
        }else{
            auto_icon = "ui-icon-play";
        }
        App.plone_jQuery(play).button({
            text: false,
            icons: {
                primary: auto_icon
            }
        });
        App.plone_jQuery(next).button({
            text: false,
            icons: {
                primary: "ui-icon-seek-end"
            }
        });
    }
});


App.AnnotationsView = Backbone.View.extend({

    template: App.get_template('scenario/annotations.html'),

    initialize: function(options) {
        this.data_revision = options['data_revision'] || '';
        this.cube_url = options['cube_url'];
        this.schema = options['schema'];
        this.dimensions_mapping = _.object(
            _(this.schema['facets']).pluck('name'),
            _(this.schema['facets']).pluck('dimension')
        );
        this.model.on('change', this.render, this);
        this.description = $('#parent-fieldname-description').detach();
        this.render();
    },

    render: function() {
        var data = [];
        var requests = [];
        var annotations = this.schema['annotations'] || {};
        _(annotations['filters']).each(function(filter, key) {
            var args = {};
            args['dimension'] = this.dimensions_mapping[filter.name];
            var facet_values = this.model.get(filter.name);
            if(!_(facet_values).isArray()){
                facet_values = [facet_values];
            }
            _(facet_values).each(function(value){
                args['value'] = value;
                if(! args['value']) {
                    return;
                }
                args['rev'] = this.data_revision;
                var url = this.cube_url + '/dimension_value_metadata';
                requests.push(
                    $.getJSON(url, args, function(resp) {
                        data.push(resp);
                        _(resp).extend({filter_name: filter.name});
                    })
                );
            }, this);
        }, this);
        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(_.bind(function() {
            if(data != []) {
                var blocks_order = _(annotations.filters).pluck('name');
                var blocks = _.chain(data).sortBy(function(item){
                    return _(blocks_order).indexOf(item['filter_name']);
                }).map(function(item){
                    var facet_name = item['filter_name'];
                    var facet = _(this.schema.facets).find(function(item){
                        return item['name'] == facet_name
                    });
                    return _(item).extend({
                        "filter_label": facet.label
                    });
                }, this).value();
                this.$el.html(this.template(
                    {"description": this.description.html(),
                     "indicators_details_url": this.cube_url + '/indicators',
                     "blocks": blocks}
                ));
            }
            else {
                this.$el.empty();
            }
        }, this));
    }

});

App.ShareOptionsView = Backbone.View.extend({

    template: App.get_template('scenario/share.html'),

    initialize: function(options) {
        this.related = $('#viewlet-below-content-body').detach();
        this.render();
    },

    render: function() {
        this.$el.html(this.template({'related': this.related.html()}));
        return this;
    }
});


App.ChartRouter = Backbone.Router.extend({

    encode: function(value) {
        return encodeURIComponent(JSON.stringify(value));
    },

    decode: function(serialized) {
        try {
            return JSON.parse(decodeURIComponent(serialized));
        }
        catch(e) {
            return {};
        }
    },

    initialize: function(model) {
        this.model = model;
        this.route(/^chart\?(.*)$/, 'chart');
        var router = this;
        this.model.on('change', function(filters) {
            var state = this.encode(filters.toJSON());
            router.navigate('chart?' + state);
        }, this);
    },

    chart: function(state) {
        var value = this.decode(state);
        this.model.set(value);
    }

});


App.main = function() {
    if(App.chart_config.chart_entry_point) {
        // obsolete bootstrapping method
        eval(App.chart_config.chart_entry_point)();
    }
    else {
        App.create_visualization($('#scenario-box')[0], App.chart_config);
    }
};


})(App.jQuery);
