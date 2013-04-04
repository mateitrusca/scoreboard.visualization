/*global App, $script */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario5_filters_schema = App.scenario1_filters_schema;


App.scenario5_initialize = function() {
    var qtip_css = App.JSAPP + '/lib/qtip-2.0.1/jquery.qtip.css';
    $('<link rel="stylesheet">').attr('href', qtip_css).appendTo($('head'));
    var box = $('#scenario-box');
    box.html(App.get_template('scenario.html')());
    box.addClass('scenario5');

    App.filters = new Backbone.Model();
    App.filter_loadstate = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    App.filters_box = new App.FiltersBox({
        el: $('#the-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        schema: App.scenario5_filters_schema
    });

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
