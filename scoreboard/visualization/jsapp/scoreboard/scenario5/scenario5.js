/*global App, $script */
/*jshint sub:true */

(function($) {
"use strict";


App.Scenario5MapView = Backbone.View.extend({

    initialize: function(options) {
        this.model.on('change', this.filters_changed, this);
        this.filters_changed();
    },

    render: function() {
        this.$el.empty();
        if(this.data) {
            App.scenario5_map(this.el, this.data);
        }
    },

    filters_changed: function() {
        var view = this;
        var args = this.model.toJSON();
        if(!(args['indicator'] && args['year'])) {
            return;
        }
        var series_ajax = $.get(App.URL + '/data', {
            'method': 'series_indicator_year',
            'indicator': args['indicator'],
            'year': 'http://data.lod2.eu/scoreboard/year/' + args['year']
        });

        series_ajax.done(function(data) {
            view.data = {'series': data};
            view.render();
        });
    }
});

App.scenario5_filters_schema = App.scenario1_filters_schema;


App.scenario5_initialize = function() {
    var qtip_css = App.JSAPP + '/lib/qtip-2.0.1/jquery.qtip.css';
    $('<link rel="stylesheet">').attr('href', qtip_css).appendTo($('head'));
    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario.html')());
    box.addClass('scenario5');

    App.filters = new Backbone.Model();
    App.filter_loadstate = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    App.filters_box = new App.FiltersBox({
        el: $('#the-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario5_filters_schema
    });

    App.scenario5_map_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario5_filters_schema,
        scenario_chart: App.scenario5_map,
        datasource: {
            client_filter: 'countries',
            rel_url: '/datapoints',
            extra_args: [
                ['fields', 'ref-area,value'],
                ['rev', App.DATA_REVISION]
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
        model: App.filters,
        field: 'indicator',
        schema: App.scenario1_filters_schema,
        footer_meta_sources:
          { 'description': {
              source: '/dimension_value_metadata',
              title: 'Label x-axis',
              filters: [
                { name: 'indicator',
                  part: 'label' },
                { name: 'breakdown',
                  part: 'label' }
              ]
            }
          }
    });
    $('#the-metadata').append(App.metadata.el);

    App.share = new App.ShareOptionsView();
    $('#the-share').append(App.share.el);

    App.navigation = new App.NavigationView({
        model: App.filters
    });

    $('#the-navigation').append(App.navigation.el);

    Backbone.history.start();
};


})(App.jQuery);
