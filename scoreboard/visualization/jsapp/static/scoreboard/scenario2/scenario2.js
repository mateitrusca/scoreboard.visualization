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
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'breakdown': 'breakdown',
             'unit-measure': 'unit-measure'
         }}
    ]
};

App.scenario2_initialize = function() {

    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario.html')());
    box.addClass('scenario2');

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);
    App.filter_loadstate = new Backbone.Model();

    App.filters_box = new App.FiltersBox({
        el: $('#the-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario2_filters_schema
    });

    App.scenario2_chart_view = new App.ScenarioChartView({
        model: App.filters,
        schema: App.scenario2_filters_schema,
        datasource: {
            data_preparation: {
                group: {
                    filter_name: 'countries',
                }
            },
            rel_url: '/datapoints',
            extra_args: [
                ['fields', 'time-period,value'],
                ['rev', App.DATA_REVISION]
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
        scenario_chart: App.scenario2_chart
    });
    $('#the-chart').prepend(App.scenario2_chart_view.el);

    App.metadata = new App.IndicatorMetadataView({
        model: App.filters,
        field: 'indicator',
        footer_meta_sources:
          { 'description': {
              source: '/dimension_value_metadata',
              filters: [
                { target: 'indicator',
                  name: 'indicator',
                  part: 'label' },
                { target: 'breakdown',
                  name: 'breakdown',
                  part: 'label' }
              ]
            }
          }
    });

    App.share = new App.ShareOptionsView();

    $('#the-metadata').append(App.metadata.el);
    $('#the-metadata').append(App.share.el);


    Backbone.history.start();

    if(! App.filters.get('countries')) {
        var EU27 = ("http://data.lod2.eu/scoreboard/country/" +
                    "European+Union+-+27+countries");
        App.filters.set('countries', ['EU27']);
    }
};

})(App.jQuery);
