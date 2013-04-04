/*global App, $script */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario5_filters_schema = App.scenario1_filters_schema;


App.scenario5_initialize = function() {
    var qtip_css = App.JSAPP + '/lib/qtip-2.0.1/jquery.qtip.css';
    $('<link rel="stylesheet">').attr('href', qtip_css).appendTo($('head'));
    var box = $('#scenario-box');
    App.visualization = new App.Visualization({
        el: box,
        schema: App.scenario5_filters_schema,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION
    });
    box.addClass('scenario5');

    App.filters = App.visualization.filters;
    App.filter_loadstate = App.visualization.filter_loadstate;
    App.router = App.visualization.router;

    App.scenario5_map_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario5_filters_schema,
        scenario_chart: App.map_chart,
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

    $('#the-chart').append(App.scenario5_map_view.el);


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
