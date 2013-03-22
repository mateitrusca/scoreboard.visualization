/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario2_filters_schema = {
    filters: [
        {type: 'select',
         name: 'indicator',
         label: 'Select one indicator',
         dimension: 'indicator',
         constraints: { }
        },
        {type: 'select',
         name: 'country',
         label: 'Select the countries',
         dimension: 'breakdown',
         constraints: {
             'indicator': 'indicator'
         }},
    ]
};

App.scenario2_initialize = function() {

    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario2/scenario2.html')());
    box.addClass('scenario2');

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    $.getJSON(App.URL + '/filters_data', function(data) {
        App.scenario2_chart_view = new App.ScenarioChartView({
            model: App.filters,
            schema: App.scenario2_filters_schema,
            datasource: {
                data_preparation: {
                    group: {
                        filter_name: 'country',
                        labels: App.get_country_labels(data),
                    }
                },
                rel_url: '/data',
                extra_args: [
                    ['method', 'series_indicator_country'],
                    ['fields', 'ref-area,value'],
                    ['rev', App.DATA_REVISION]
                ]
            },
            scenario_chart: App.scenario2_chart
        });
        $('#the-chart').append(App.scenario2_chart_view.el);
        App.scenario2_chart_view.filters_changed();

        App.metadata = new App.IndicatorMetadataView({
            model: App.filters,
            field: 'indicator',
            indicators: App.get_indicators(data)
        });
        $('#the-metadata').append(App.metadata.el);

    });

    Backbone.history.start();

    if(! App.filters.get('country')) {
        var EU27 = ("http://data.lod2.eu/scoreboard/country/" +
                    "European+Union+-+27+countries");
        App.filters.set('country', [EU27]);
    }
};

})(App.jQuery);
