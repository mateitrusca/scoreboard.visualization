/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario1_filters_schema = {
    filters: [
        {type: 'select',
         name: 'indicator-group',
         label: 'Indicator group',
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'indicator',
         label: 'Indicator',
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'indicator-group'
         }},
        {type: 'select',
         name: 'time-period',
         label: 'Period',
         dimension: 'time-period',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'breakdown-group',
         label: 'Breakdown group',
         dimension: 'breakdown-group',
         constraints: {
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'breakdown',
         label: 'Breakdown',
         dimension: 'breakdown',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'unit-measure',
         label: 'Unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'breakdown': 'breakdown',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'multiple_select',
         name: 'countries',
         label: 'Country / Countries',
         dimension: 'ref-area',
         default_all: true,
         position: '.right_column',
         constraints: {
             'unit-measure': 'unit-measure',
             'breakdown-group': 'breakdown-group',
             'breakdown': 'breakdown',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }}
    ],
    annotations: {
        'description': {
            source: '/dimension_value_metadata',
            title: 'Label x-axis',
            filters: [{name: 'indicator', part: 'label'},
                      {name: 'breakdown', part: 'label'}]
        }
    }
};


App.scenario1_initialize = function() {

    var box = $('#scenario-box');
    App.visualization = new App.Visualization({el: box});

    App.filters = App.visualization.filters;
    App.filter_loadstate = App.visualization.filter_loadstate;
    App.router = App.visualization.router;

    App.filters_box = new App.FiltersBox({
        el: $('#the-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        schema: App.scenario1_filters_schema
    });

    App.scenario1_chart_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario1_filters_schema,
        scenario_chart: App.columns_chart,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        datasource: {
            client_filter: 'countries',
            rel_url: '/datapoints',
            extra_args: [
                ['fields', 'ref-area,value']
            ]
        },
        meta_labels: [
            { targets: ['x_title'], filter_name: 'indicator', type: 'label' },
            { targets: ['y_title', 'tooltip_label'], filter_name: 'unit-measure', type: 'short_label' },
            { targets: ['year_text'], filter_name: 'time-period', type: 'label' }
        ]
    });
    $('#the-chart').append(App.scenario1_chart_view.el);

    App.metadata = new App.IndicatorMetadataView({
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        model: App.filters,
        field: 'indicator',
        schema: App.scenario1_filters_schema
    });
    $('#the-metadata').append(App.metadata.el);

    App.share = new App.ShareOptionsView();
    $('#the-share').append(App.share.el);

    App.navigation = new App.NavigationView({
        cube_url: App.URL,
        scenario_url: App.SCENARIO_URL
    });

    $('#the-navigation').append(App.navigation.el);

    Backbone.history.start();
};

})(App.jQuery);
