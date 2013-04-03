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
        this.meta_labels = options['meta_labels'];
        this.schema = options['schema'];
        this.scenario_chart = options['scenario_chart'];
        this.dimensions_mapping = _.object(
            _(options.schema.filters).pluck('name'),
            _(options.schema.filters).pluck('dimension')
        );
        this.datasource = options['datasource'];
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

        _(this.meta_labels).forEach(function(item) {
            var args = {
                'dimension': this.dimensions_mapping[item.filter_name],
                'value': this.model.get(item['filter_name']),
                'rev': this.data_revision
            };
            var ajax = $.get(this.cube_url + '/dimension_labels', args);
            ajax.done(function(data) {
                _(item['targets']).each(function(target){
                    meta_data[target] = data[item['type']];
                });
            });
            requests.push(ajax);
        }, this);

        return requests;
    },

    load_chart: function() {
        _(this.requests_in_flight).forEach(function(req) { req.abort(); });
        this.requests_in_flight = [];
        var incomplete = false;
        var args = {};
        var groupby = this.datasource['groupby'];
        var client_filter = this.datasource.client_filter;
        var requests = [];
        _(this.dimensions_mapping).each(function(dimension, filter_name) {
            if(filter_name != groupby && filter_name != client_filter) {
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
        _(this.datasource['extra_args']).each(function(item) {
            args[item[0]] = item[1];
        });

        var chart_data = {
            'tooltip_formatter': function() {
                var tooltip_label = chart_data.meta_data['tooltip_label'];
                return '<b>'+ this.x +'</b><br>: ' +
                       Math.round(this.y*10)/10 + ' ' + tooltip_label;
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
            'group_labels': {}
        };

        var group_values = null;

        if (groupby) {
            group_values = this.model.get(groupby);
            requests = _(group_values).map(function(value) {
                var dimension = this.dimensions_mapping[groupby];
                args[dimension] = value;
                return $.get(this.cube_url + this.datasource['rel_url'], args);
            }, this);

            var labels_args = {
                'dimension': this.dimensions_mapping[groupby],
                'rev': this.data_revision
            };
            var labels_request = $.get(this.cube_url + '/dimension_values', labels_args);
            labels_request.done(function(data) {
                var results = data['options'];
                chart_data['group_labels'] = _.object(
                    _(results).pluck('notation'),
                    _(results).pluck('label'));
            });
            requests.push(labels_request);
        }
        else {
            group_values = [null];
            requests.push($.get(this.cube_url + this.datasource['rel_url'], args));
        }

        var client_filter_options = [];
        if(client_filter) {
            client_filter_options = this.model.get(client_filter);
        }

        _(this.get_meta_data(chart_data)).forEach(function(req) {
            requests.push(req);
        });

        this.requests_in_flight = requests;

        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(_.bind(function() {
            var responses = _(arguments).toArray();
            if(requests.length < 2) { responses = [responses]; }
            chart_data['series'] = _(group_values).map(function(value, n) {
                var resp = responses[n];
                var datapoints = resp[0]['datapoints'];
                if(this.datasource.client_filter) {
                    var dimension = this.dimensions_mapping[client_filter];
                    datapoints = _(datapoints).filter(function(item) {
                        return _(client_filter_options).contains(item[dimension]);
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


App.IndicatorMetadataView = Backbone.View.extend({

    template: App.get_template('scoreboard/metadata.html'),

    initialize: function(options) {
        this.data_revision = options['data_revision'] || '';
        this.cube_url = options['cube_url'];
        this.dimensions_mapping = _.object(
            _(options.schema.filters).pluck('name'),
            _(options.schema.filters).pluck('dimension')
        );
        this.footer_meta_sources = options['footer_meta_sources'];
        this.model.on('change', this.render, this);
        this.description = $('#parent-fieldname-description').detach();
        this.render();
    },

    render: function() {
        var data = [];
        var requests = [];
        _(this.footer_meta_sources).map(function(item, key) {
            var source = item['source'];
            var filters = item['filters'];
            var info_block = {};
            _(filters).map(function(filter) {
                var args = {};
                args['dimension'] = this.dimensions_mapping[filter.name];
                args['value'] = this.model.get(filter.name);
                if(! args['value']) {
                    return;
                }
                args['rev'] = this.data_revision;
                info_block['title'] = item['title'];
                requests.push(
                    $.get(this.cube_url + source, args, function(resp) {
                        info_block['info'] = info_block['info'] || [];
                        info_block['info'].push(resp[filter.part]);
                    })
                );
            }, this);
            data.push(info_block);
        }, this);
        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(_.bind(function() {
            if(data != []) {
                this.$el.html(this.template(
                    {"description": this.description.html(),
                     "blocks": data}
                ));
            }
            else {
                this.$el.empty();
            }
        }, this));
    }

});


App.ShareOptionsView = Backbone.View.extend({

    template: App.get_template('scoreboard/share.html'),

    initialize: function(options) {
        this.related = $('#viewlet-below-content-body').detach();
        this.render();
    },

    render: function() {
        this.$el.html(this.template({'related': this.related.html()}));
        return this;
    }
});


App.NavigationView = Backbone.View.extend({

    id: 'scenarios',

    template: App.get_template('scoreboard/navigation.html'),

    events: {
        'click img': 'on_selection_change'
    },

    initialize: function(options) {
        this.cube_url = options['cube_url'];
        this.model.on('change:scenario', this.render, this);
        this.render();
    },

    fetch_scenarios: function(){
        return $.get(this.cube_url + '/@@relations');
    },

    on_selection_change: function(e){
        var value = $(e.target).parent().parent().attr('id');
        this.model.set('scenario', value);
    },

    render: function() {
        this.ajax = this.fetch_scenarios();
        this.ajax.done(
            _.bind(function(resp){
                var data = _(resp).map(_.bind(function(item){
                    if(item['url'] == App.SCENARIO_URL){
                        item['selected'] = true;
                    }
                    return item;
                }, this));
                this.$el.html(this.template({
                    "scenarios": data
                }));
            }, this));
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


})(App.jQuery);
