/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.ScenarioChartView = Backbone.View.extend({

    className: 'highcharts-chart',

    initialize: function(options) {
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
        this.load_chart();
    },

    render: function() {
        if(this.data) {
            this.scenario_chart(this.el, this.data, this.data.meta_data);
        }
    },

    get_meta_data: function(chart_data){
        var view = this;
        var meta_data = {};
        chart_data['meta_data'] = meta_data;

        function process_ajax(args){
            var ajax = $.get(App.URL + '/dimension_labels',
                {
                    'dimension': args['dimension'],
                    'value': view.model.get(args['filter_name']),
                    'rev': App.DATA_REVISION
                }
            );
            return ajax.done( function(data) { args.callback(args, data); });
        }

        var ajax_args = _(this.meta_labels).map(function(item){
            var result = {
                filter_name: item.filter_name,
                dimension: view.dimensions_mapping[item.filter_name],
                targets: item.targets,
                label_type: item.type,
                callback: function(args, data){
                    _(args['targets']).each(function(target){
                        meta_data[target] = data[args['label_type']];
                    });
                }
            };
            return result;
        });

        var ajax_queue = _(ajax_args).map(process_ajax);
        var ajax_calls = $.when.apply($, ajax_queue);
        return ajax_calls;

    },

    load_chart: function() {
        var incomplete = false;
        var args = {};
        var groupby = this.datasource['groupby'];
        var client_filter = this.datasource.client_filter;
        var requests = [];
        _(this.dimensions_mapping).each(function(dimension, filter_name) {
            if(filter_name != groupby && filter_name != client_filter) {
                args[dimension] = this.model.get(filter_name);
                if(! args[dimension]) { incomplete = true; }
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
                return $.get(App.URL + this.datasource['rel_url'], args);
            }, this);

            var labels_args = {
                'dimension': this.dimensions_mapping[groupby],
                'rev': App.DATA_REVISION
            };
            var labels_request = $.get(App.URL + '/dimension_values', labels_args);
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
            requests.push($.get(App.URL + this.datasource['rel_url'], args));
        }

        var client_filter_options = [];
        if(client_filter) {
            client_filter_options = this.model.get(client_filter);
        }

        requests.push(this.get_meta_data(chart_data));

        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(_.bind(function() {
            var responses = _(arguments).toArray();
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
        _(this.footer_meta_sources).map(_.bind(function(item, key){
            var source = item['source'];
            var filters = item['filters'];
            var info_block = {};
            _(filters).map(_.bind(function(filter){
                var args = {};
                args['dimension'] = this.dimensions_mapping[filter.name];
                args['value'] = this.model.get(filter.name);
                if(! args['value']){
                    return;
                }
                args['rev'] = App.DATA_REVISION;
                info_block['title'] = this.title;
                requests.push(
                    $.get(App.URL + this.source, args, _.bind(function(resp){
                        this.info_block['info'] = info_block['info'] || [];
                        this.info_block['info'].push(resp[filter.part]);
                    },
                    {'filter': filter, 'info_block': this.info_block}))
                );
            },
            {'source': source,
             'model': this.model,
             'title': item['title'],
             'info_block': info_block,
             'dimensions_mapping': this.dimensions_mapping}
           ));
           data.push(info_block);
        }, this));
        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(_.bind(function(){
            if(data != []){
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
        this.render();
    },

    render: function() {
        this.$el.html(this.template());
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
        this.model.on('change:scenario', this.render, this);
        this.render();
    },

    fetch_scenarios: function(){
        return $.get(App.URL + '/@@relations');
    },

    on_selection_change: function(e){
        var value = $(e.target).parent().attr('title');
        this.model.set('scenario', value);
    },

    render: function() {
        this.ajax = this.fetch_scenarios();
        this.ajax.done(
            _.bind(function(resp){
                var data = _(resp).map(_.bind(function(item){
                    if(item['title'] == this.model.get('scenario')){
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


App.get_indicators = function(filters_data) {
    var indicators = filters_data['indicators'];
    return _.object(_(indicators).pluck('uri'), indicators);
};


App.get_indicator_labels = function(filters_data) {
    var indicators = filters_data['indicators'];
    return _.object(_(indicators).pluck('uri'),
                    _(indicators).pluck('label'));
};


App.get_country_labels = function(filters_data) {
    var countries = filters_data['countries'];
    return _.object(_(countries).pluck('notation'),
                    _(countries).pluck('label'));
};


App.ChartRouter = Backbone.Router.extend({

    encode: function(value) {
        return _(value).map(function(v, k) {
            if(_.isArray(v)) {
                v = '[' + _(v).map(encodeURIComponent).join(',') + ']';
            }
            else {
                v = encodeURIComponent(v);
            }
            return k + '=' + v;
        }).join('&');
    },

    decode: function(serialized) {
        try {
            if(! serialized) { return {}; }
            return _(_(serialized.split('&')).map(function(pair) {
                if(! _(pair).contains('=')) { throw new Error(); }
                var bits = pair.split('=');
                var k = bits.shift();
                var v = bits.join('=');
                if(_(v).first() == '[' && _(v).last() == ']') {
                    v = v.slice(1, -1);
                    v = v ? v.split(',') : [];
                    v = _(v).map(decodeURIComponent);
                }
                else {
                    v = decodeURIComponent(v);
                }
                return [k, v];
            })).object();
        }
        catch(e) {
            return {};
        }
    },

    initialize: function(model) {
        this.model = model;
        this.route(/^f\?(.*)$/, 'f');
        var router = this;
        this.model.on('change', function(filters) {
            var state = this.encode(filters.toJSON());
            router.navigate('f?' + state);
        }, this);
    },

    f: function(state) {
        var value = this.decode(state);
        this.model.set(value);
    }

});


var country_data = [
    {code: 'AT',   color: '#AABC66', label: "Austria"},
    {code: 'BE',   color: '#FD8245', label: "Belgium"},
    {code: 'BG',   color: '#21FF00', label: "Bulgaria"},
    {code: 'CY',   color: '#FF5400', label: "Cyprus"},
    {code: 'CZ',   color: '#1C3FFD', label: "Czech Republic"},
    {code: 'DE',   color: '#FFC600', label: "Germany"},
    {code: 'DK',   color: '#45BF55', label: "Denmark"},
    {code: 'EE',   color: '#0EEAFF', label: "Estonia"},
    {code: 'GR',   color: '#6A07B0', label: "Greece"},
    {code: 'ES',   color: '#044C29', label: "Spain"},
    {code: 'FI',   color: '#7FB2F0', label: "Finland"},
    {code: 'FR',   color: '#15A9FA', label: "France"},
    {code: 'HR',   color: '#33EED2', label: "Croatia"},
    {code: 'HU',   color: '#D40D12', label: "Hungary"},
    {code: 'IE',   color: '#ADF0F6', label: "Ireland"},
    {code: 'IS',   color: '#662293', label: "Iceland"},
    {code: 'IT',   color: '#19BC01', label: "Italy"},
    {code: 'LT',   color: '#9A24ED', label: "Lithuania"},
    {code: 'LU',   color: '#D50356', label: "Luxembourg"},
    {code: 'LV',   color: '#D59AFE', label: "Latvia"},
    {code: 'MT',   color: '#35478C', label: "Malta"},
    {code: 'NL',   color: '#FF40F4', label: "Netherlands"},
    {code: 'NO',   color: '#F70A9B', label: "Norway"},
    {code: 'PL',   color: '#FF1D23', label: "Poland"},
    {code: 'PT',   color: '#FFFC00', label: "Portugal"},
    {code: 'RO',   color: '#1B76FF', label: "Romania"},
    {code: 'SE',   color: '#436B06', label: "Sweden"},
    {code: 'SI',   color: '#648E23', label: "Slovenia"},
    {code: 'SK',   color: '#7DC30F', label: "Slovak Republic"},
    {code: 'TR',   color: '#9900AB', label: "Turkey"},
    {code: 'GB',   color: '#D000C4', label: "United Kingdom"},
    {code: 'EU27', color: '#94090D', label: "European Union - 27 countries"}
];


App.COUNTRY_COLOR = _.object(_(country_data).pluck('code'),
                             _(country_data).pluck('color'));


App.COUNTRY_CODE = _.object(_(country_data).pluck('label'),
                            _(country_data).pluck('code'));


App.COUNTRY_NAME = _.object(_(country_data).pluck('code'),
                            _(country_data).pluck('label'));


})(App.jQuery);
