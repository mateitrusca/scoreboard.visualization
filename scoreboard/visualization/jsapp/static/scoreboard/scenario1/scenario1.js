/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.Scenario1FiltersView = Backbone.View.extend({

    template: App.get_template('scoreboard/scenario1/filters.html'),

    events: {
        'change select': 'update_filters',
        'change input[name=year]': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        if(! this.model.get('indicator')) {
            var first_indicator = options['filters_data']['indicators'][0];
            this.model.set({
                'indicator': first_indicator['uri'],
                'year': first_indicator['years'][0]
            });
        }
        this.model.on('change', this.render, this);
        this.render();
    },

    get_options: function(value) {
        var data = JSON.parse(this.filters_data);
        var index = App.index_by(data['indicators'], 'uri');
        var indicator = index[value['indicator']];

        if(indicator) {
            data['years'] = _(indicator['years']).map(function(year) {
                return {
                    'value': year,
                    'selected': (year == value['year'])
                };
            });
            indicator['selected'] = true;
        }

        return data;
    },

    render: function() {
        var options = this.get_options(this.model.toJSON());
        this.$el.html(this.template(options));
    },

    update_filters: function() {
        var new_value = {'indicator': this.$el.find('select').val()};
        var year = this.$el.find('input[name=year]:checked').val();
        var options = this.get_options(new_value);
        var available_years = _(_(options['years']).pluck('value'));
        if(! available_years.contains(year)) { year = null; }
        new_value['year'] = year;
        this.model.set(new_value);
    }

});


App.Scenario1ChartView = Backbone.View.extend({

    className: 'highcharts-chart',

    initialize: function(options) {
        this.model.on('change', this.filters_changed, this);
        this.meta_data = options['meta_data'];
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.loadstate.on('change', this.filters_changed, this);
        this.dynamic_labels = options['dynamic_labels'];
        this.dimensions_mapping = _.object(
            _(options.schema.filters).pluck('name'),
            _(options.schema.filters).pluck('dimension')
        );
        this.filters_changed();
    },

    render: function() {
        if(this.data && this.meta_data) {
            App.scenario1_chart(this.el, this.data, this.meta_data);
        }
    },

    get_meta_data: function(){

        var view = this;
        var meta_data = {};

        function process_ajax(args){
            var ajax = $.get(App.URL + '/dimension_labels',
                {
                    'dimension': args['dimension'],
                    'value': view.model.get(args['dimension']),
                    'rev': App.DATA_REVISION
                }
            );
            return ajax.done( function(data) { args.callback(args, data); });
        }

        var ajax_args = _(this.dynamic_labels).map(function(item){
            var result = {
                dimension: view.dimensions_mapping[item.filter_name],
                 target: item.target,
                 label_type: item.type,
                 callback: function(args, data){
                    meta_data[args['target']] = data[args['label_type']];
                    //meta_data['tooltip_label'] = data[args['label_type']];}
                }
            };
            return result;
        });

        var ajax_queue = _(ajax_args).map(process_ajax);
        var ajax_calls = $.when.apply($, ajax_queue);
        ajax_calls.done(
            function(){
                meta_data['year_text'] = 'Year ' + view.model.get('time-period');
                view.meta_data = meta_data;
                view.render();
            }
        );

    },

    filters_changed: function() {
        var incomplete = false;
        var args = this.model.toJSON();
        var required = _(App.scenario1_filters_schema['filters']).pluck('name');
        _(required).forEach(function(field) {
            if(! args[field]) { incomplete = true; }
            if(this.loadstate.get(field)) { incomplete = true; }
        }, this);
        if(incomplete) {
            // not all filters have values
            this.$el.html('--');
            return;
        }
        args['fields'] = 'ref-area,value';
        args['rev'] = App.DATA_REVISION;
        this.$el.html('-- loading --');
        var series_ajax = $.get(App.URL + '/datapoints', args);
        var series_ajax_result = series_ajax.done(_.bind(function(data) {
            this.data = {
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
        }, this));

        //TODO gets meta data everytime filters changed
        //if needed, it could be optimized to fetch labels
        //only when relevant filters change
        series_ajax_result.done( _.bind(this.get_meta_data, this) );

    }

});


App.scenario1_filters_schema = {
    filters: [
        {type: 'select',
         name: 'indicator-group',
         label: 'Select indicator group',
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'indicator',
         label: 'Select indicator',
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'indicator-group'
         }},
        {type: 'select',
         name: 'time-period',
         label: 'Select period',
         dimension: 'time-period',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'breakdown-group',
         label: 'Select breakdown group',
         dimension: 'breakdown-group',
         constraints: {
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'radio',
         name: 'breakdown',
         label: 'Select breakdown',
         dimension: 'breakdown',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'radio',
         name: 'unit-measure',
         label: 'Select unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'breakdown': 'breakdown',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }}
    ]
};


App.scenario1_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario1/scenario1.html')());

    App.filters = new Backbone.Model();
    App.filter_loadstate = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    App.filters_box = new App.FiltersBox({
        el: $('#new-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario1_filters_schema
    });

    App.scenario1_chart_view = new App.Scenario1ChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        meta_data: {},
        schema: App.scenario1_filters_schema,
        dynamic_labels: [
            { target: 'x_title', filter_name: 'indicator', type: 'label' },
            { target: 'y_title', filter_name: 'unit-measure', type: 'short_label' }
        ]
    });
    $('#the-chart').append(App.scenario1_chart_view.el);

    Backbone.history.start();
};

})(App.jQuery);
