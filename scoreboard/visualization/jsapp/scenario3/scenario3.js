/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario3_filters_schema = {
    filters: [
        {type: 'select',
         name: 'x-indicator-group',
         label: "(X) indicator group",
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'x-indicator',
         label: "(X) indicator",
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'x-indicator-group'
         }},
        {type: 'select',
         name: 'x-breakdown-group',
         label: "(X) breakdown group",
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'x-indicator'
         }},
        {type: 'select',
         name: 'x-breakdown',
         label: "(X) breakdown",
         dimension: 'breakdown',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown-group': 'x-breakdown-group'
         }},
        {type: 'select',
         name: 'x-unit-measure',
         label: "(X) unit of measure",
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown':       'x-breakdown'
         }},

        {type: 'select',
         name: 'y-indicator-group',
         label: "(Y) indicator group",
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'y-indicator',
         label: "(Y) indicator",
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'y-indicator-group'
         }},
        {type: 'select',
         name: 'y-breakdown-group',
         label: "(Y) breakdown group",
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'y-indicator'
         }},
        {type: 'select',
         name: 'y-breakdown',
         label: "(Y) breakdown",
         dimension: 'breakdown',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown-group': 'y-breakdown-group'
         }},
        {type: 'select',
         name: 'y-unit-measure',
         label: "(Y) unit of measure",
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown':       'y-breakdown'
         }},
        {type: 'select',
         xy: true,
         name: 'time-period',
         label: "Year",
         dimension: 'time-period',
         constraints: {
             'x-indicator':    'x-indicator',
             'x-breakdown':    'x-breakdown',
             'x-unit-measure': 'x-unit-measure',
             'y-indicator':    'y-indicator',
             'y-breakdown':    'y-breakdown',
             'y-unit-measure': 'y-unit-measure'
         }},
        {type: 'multiple_select',
         xy: true,
         name: 'countries',
         label: 'Country / Countries',
         dimension: 'ref-area',
         default_all: true,
         position: '.right_column',
         constraints: {
             'x-indicator':    'x-indicator',
             'x-breakdown':    'x-breakdown',
             'x-unit-measure': 'x-unit-measure',
             'y-indicator':    'y-indicator',
             'y-breakdown':    'y-breakdown',
             'y-unit-measure': 'y-unit-measure',
             'time-period': 'time-period'
         }}
    ],
    annotations: {
        'x': {
            title: "Label x-axis",
            source: '/dimension_value_metadata',
            filters: [{target: 'indicator', name: 'x-indicator', part: 'label'},
                      {target: 'breakdown', name: 'x-breakdown', part: 'label'}]
        },
        'y': {
            title: "Label y-axis",
            source: '/dimension_value_metadata',
            filters: [{name: 'y-indicator', part: 'label'},
                      {name: 'y-breakdown', part: 'label'}]
        }
    }
};


App.scenario3_initialize = function() {

    var box = $('#scenario-box');
    App.visualization = new App.Visualization({
        el: box,
        schema: App.scenario3_filters_schema,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION
    });
    box.addClass('scenario3');

    App.filters = App.visualization.filters;
    App.filter_loadstate = App.visualization.filter_loadstate;
    App.router = App.visualization.router;

    App.scenario3_chart_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario3_filters_schema,
        scenario_chart: App.scatter_chart,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        datasource: {
            client_filter: 'countries',
            rel_url: '/datapoints_xy',
            extra_args: [
                ['columns', 'ref-area'],
                ['xy_columns', 'value']
            ]
        },
        meta_labels: [
            { targets: ['indicator_x_label'], filter_name: 'x-indicator', type: 'short_label' },
            { targets: ['indicator_y_label'], filter_name: 'y-indicator', type: 'short_label' },
            { targets: ['period_label'], filter_name: 'time-period', type: 'label' },
            { targets: ['x_unit_label'], filter_name: 'x-unit-measure', type: 'short_label' },
            { targets: ['y_unit_label'], filter_name: 'y-unit-measure', type: 'short_label' },
        ]
    });
    $('#the-chart').append(App.scenario3_chart_view.el);


    App.navigation = new App.NavigationView({
        cube_url: App.URL,
        scenario_url: App.SCENARIO_URL
    });

    $('#the-navigation').append(App.navigation.el);

    Backbone.history.start();

};


})(App.jQuery);
