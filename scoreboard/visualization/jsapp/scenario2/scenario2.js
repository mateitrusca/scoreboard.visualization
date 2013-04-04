/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario2_filters_schema = {
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
         }
        },
        {type: 'select',
         name: 'breakdown',
         label: 'Breakdown',
         dimension: 'breakdown',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'unit-measure',
         label: 'Unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'breakdown': 'breakdown'
         }},
        {type: 'multiple_select',
         name: 'countries',
         label: 'Countries',
         dimension: 'ref-area',
         position: '.right_column',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'breakdown': 'breakdown',
             'unit-measure': 'unit-measure'
         }}
    ],
    annotations: {
        'description': {
            title: "Label x-axis",
            source: '/dimension_value_metadata',
            filters: [{name: 'indicator', part: 'label'},
                      {name: 'breakdown', part: 'label'}]
        }
    }
};

App.scenario2_initialize = function() {

    var box = $('#scenario-box');
    App.visualization = new App.Visualization({
        el: box,
        schema: App.scenario2_filters_schema,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION
    });
    box.addClass('scenario2');

    App.filters = App.visualization.filters;
    App.filter_loadstate = App.visualization.filter_loadstate;
    App.router = App.visualization.router;

    App.filters_box = new App.FiltersBox({
        el: $('#the-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        schema: App.scenario2_filters_schema
    });

    App.scenario2_chart_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario2_filters_schema,
        datasource: {
            groupby: 'countries',
            rel_url: '/datapoints',
            extra_args: [
                ['fields', 'time-period,value']
            ]
        },
        meta_labels: [
            { targets: ['x_title'],
              filter_name: 'indicator',
              type: 'short_label' },
            { targets: ['y_title', 'unit'],
              filter_name: 'unit-measure',
              type: 'short_label' }
        ],
        scenario_chart: App.lines_chart,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION
    });
    $('#the-chart').prepend(App.scenario2_chart_view.el);

    App.share = new App.ShareOptionsView();

    $('#the-share').append(App.share.el);

    App.navigation = new App.NavigationView({
        cube_url: App.URL,
        scenario_url: App.SCENARIO_URL
    });

    $('#the-navigation').append(App.navigation.el);


    Backbone.history.start();

    if(! App.filters.get('countries')) {
        var EU27 = ("http://data.lod2.eu/scoreboard/country/" +
                    "European+Union+-+27+countries");
        App.filters.set('countries', ['EU27']);
    }
};

})(App.jQuery);
