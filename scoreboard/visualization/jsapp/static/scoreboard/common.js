/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.ScenarioChartView = Backbone.View.extend({

    className: 'highcharts-chart',

    initialize: function(options) {
        this.model.on('change', this.filters_changed, this);
        this.meta_data = options['meta_data'];
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.loadstate.on('change', this.filters_changed, this);
        this.meta_labels = options['meta_labels'];
        this.schema = options['schema'];
        this.scenario_chart = options['scenario_chart'];
        this.dimensions_mapping = _.object(
            _(options.schema.filters).pluck('name'),
            _(options.schema.filters).pluck('dimension')
        );
        this.datasource = options['datasource']
        this.filters_changed();
    },

    render: function() {
        if(this.data) {
            this.scenario_chart(this.el, this.data, this.meta_data);
        }
    },

    get_meta_data: function(){
        var view = this;
        var meta_data = {};

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
        return ajax_calls.done(
            function(){
                view.meta_data = meta_data;
                //view.render();
            }
        );

    },

    filters_changed: function() {
        var incomplete = false;
        var args = {};
        var groupby = this.datasource['groupby'];
        var requests = [];
        var view = this;
        _(this.dimensions_mapping).each(_.bind(function(dimension, filter_name){
            if(filter_name != groupby){
                args[dimension] = this.model.get(filter_name);
            }
        }, this));
        var required_filters = _(this.schema['filters']).reject(function(item){
            return item['name'] === groupby;
        })
        var required = _(required_filters).pluck('dimension');
        _(required).forEach(function(field) {
            if(! args[field]) { incomplete = true; }
            if(this.loadstate.get(field)) { incomplete = true; }
        }, this);
        if(incomplete) {
            // not all filters have values
            this.$el.html('--');
            return;
        }
        this.$el.html('-- loading --');
        _(this.datasource['extra_args']).each(function(item){
            args[item[0]] = item[1];
        });
        if (groupby){
            var countries = this.model.get(groupby);
            requests = _(countries).map(_.bind(function(country) {
                var dimension = this.dimensions_mapping[groupby];
                args[dimension] = country;
                var data_ajax = $.get(App.URL + this.datasource['rel_url'], args);
                return data_ajax;
            }, this));

            requests.push( $.get(App.URL + '/dimension_values',
                {
                    'dimension': this.dimensions_mapping[groupby],
                    'rev': App.DATA_REVISION
                },
                function(data){
                    var results = data['options'];
                    view.group_labels = _.object(
                             _(results).pluck('notation'),
                             _(results).pluck('label')
                           );
                }
            ));

            requests.push(_.bind(this.get_meta_data, this)());

            var ajax_calls = $.when.apply($, requests);
            var series_ajax_result = ajax_calls.done(function() {
                var responses = (requests.length == 1) ? _([arguments])
                                                       : _(arguments).toArray().slice(0,-2);
                var series = _(responses).map(function(resp, n) {
                    return {
                        'label': view.group_labels[countries[n]],
                        'data': resp[0]['datapoints']
                    };
                });
                view.data = {
                    'series': series,
                    'credits': {
                        'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                        'text': 'European Commission, Digital Agenda Scoreboard'
                    }
                };
            });
        }
        else{
            requests.push($.get(App.URL + this.datasource['rel_url'], args));
            requests.push(_.bind(this.get_meta_data, this)());
            var ajax_calls = $.when.apply($, requests);
            var series_ajax_result = ajax_calls.done(function() {
                var data = arguments[0][0];
                view.data = {
                    'series': data['datapoints'],
                    'tooltip_formatter': function() {
                        var chart_view = App.scenario1_chart_view;
                        var tooltip_label = chart_view.meta_data['tooltip_label'];
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
                        return this.value
                    },
                };
            });
        }

        //TODO gets meta data everytime filters changed
        //if needed, it could be optimized to fetch labels
        //only when relevant filters change
        series_ajax_result.done(_.bind(function(){
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
                )
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
                this.$el.html(this.template({"blocks": data}));
            }
            else {
                this.$el.empty();
            }
        }, this))
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

    initialize: function(model) {
        this.model = model;
        this.route(/^chart\?(.*)$/, 'chart');
        var router = this;
        this.model.on('change', function(filters) {
            var state = encodeURIComponent(JSON.stringify(filters.toJSON()));
            router.navigate('chart?' + state);
        });
    },

    chart: function(state) {
        var value = JSON.parse(decodeURIComponent(state));
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
