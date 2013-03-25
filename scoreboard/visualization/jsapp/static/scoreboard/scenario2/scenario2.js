/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario2_filters_schema = {
    filters: [
        {type: 'select',
         name: 'indicator-group',
         label: 'Select indicator group',
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'indicator',
         label: 'Select one indicator',
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'indicator-group'
         }
        },
        {type: 'multiple_select',
         name: 'countries',
         label: 'Select the countries',
         dimension: 'ref-area',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'radio',
         name: 'breakdown',
         label: 'Select breakdown',
         dimension: 'breakdown',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'radio',
         name: 'unit-measure',
         label: 'Select unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }}
    ]
};

App.scenario2_initialize = function() {

    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario2/scenario2.html')());
    box.addClass('scenario2');

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);
    App.filter_loadstate = new Backbone.Model();

    App.filters_box = new App.FiltersBox({
        el: $('#new-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario2_filters_schema
    });

    $.getJSON(App.URL + '/filters_data', function(data) {
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
        $('#the-chart').append(App.scenario2_chart_view.el);
        //App.scenario2_chart_view.filters_changed();
        /*
        App.metadata = new App.IndicatorMetadataView({
            model: App.filters,
            field: 'indicator',
            indicators: App.get_indicators(data)
        });
        $('#the-metadata').append(App.metadata.el);
        */

    });

    Backbone.history.start();

    if(! App.filters.get('countries')) {
        var EU27 = ("http://data.lod2.eu/scoreboard/country/" +
                    "European+Union+-+27+countries");
        App.filters.set('countries', ['EU27']);
    }
};

})(App.jQuery);
