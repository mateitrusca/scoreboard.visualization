/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


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

    App.scenario1_chart_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        meta_data: {},
        schema: App.scenario1_filters_schema,
        scenario_chart: App.scenario1_chart,
        datasource: {
            rel_url: '/datapoints',
            extra_args: [
                ['fields', 'ref-area,value'],
                ['rev', App.DATA_REVISION]
            ]
        },
        meta_labels: [
            { targets: ['x_title'], filter_name: 'indicator', type: 'label' },
            { targets: ['y_title', 'tooltip_label'], filter_name: 'unit-measure', type: 'short_label' },
            { targets: ['year_text'], filter_name: 'time-period', type: 'label' },
        ]
    });
    $('#the-chart').append(App.scenario1_chart_view.el);

    Backbone.history.start();
};

})(App.jQuery);
