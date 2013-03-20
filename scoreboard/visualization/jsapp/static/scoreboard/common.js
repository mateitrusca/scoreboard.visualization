/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.IndicatorMetadataView = Backbone.View.extend({

    template: App.get_template('scoreboard/metadata.html'),

    initialize: function(options) {
        this.indicators = options['indicators'];
        this.field = options['field'];
        this.model.on('change:' + this.field, this.render, this);
        this.render();
    },

    render: function() {
        var indicator = this.model.get(this.field);
        if(indicator) {
            var data = this.indicators[indicator];
            this.$el.html(this.template(data));
        }
        else {
            this.$el.empty();
        }
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
    return _.object(_(countries).pluck('uri'),
                    _(countries).pluck('label'));
};


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
        if(this.data && this.meta_data) {
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
        ajax_calls.done(
            function(){
                view.meta_data = meta_data;
                view.render();
            }
        );

    },

    filters_changed: function() {
        var incomplete = false;
        var args = this.model.toJSON();
        var required = _(this.schema['filters']).pluck('name');
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
        var series_ajax = $.get(App.URL + this.datasource['rel_url'], args);
        var series_ajax_result = series_ajax.done(_.bind(function(data) {
            this.data = {
                'series': data['datapoints'],
                'tooltip_formatter': function() {
                    var chart_view = App.scenario_chart_view;
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
        }, this));

        //TODO gets meta data everytime filters changed
        //if needed, it could be optimized to fetch labels
        //only when relevant filters change
        series_ajax_result.done( _.bind(this.get_meta_data, this) );

    }

});


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
