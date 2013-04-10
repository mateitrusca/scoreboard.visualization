/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.Visualization = Backbone.View.extend({

    template: App.get_template('scenario.html'),

    initialize: function(options) {
        this.$el.html(this.template());
        this.filters = new Backbone.Model();
        this.filter_loadstate = new Backbone.Model();
        this.router = new App.ChartRouter(this.filters);

        this.filters_box = new App.FiltersBox({
            el: this.$el.find('#the-filters'),
            model: this.filters,
            loadstate: this.filter_loadstate,
            cube_url: options['cube_url'],
            data_revision: options['data_revision'],
            schema: options['schema']
        });

        this.metadata = new App.AnnotationsView({
            el: this.$el.find('#the-metadata'),
            cube_url: options['cube_url'],
            data_revision: options['data_revision'],
            model: this.filters,
            field: 'indicator',
            schema: options['schema']
        });

        this.share = new App.ShareOptionsView({
            el: this.$el.find('#the-share')
        });

        this.navigation = new App.NavigationView({
            el: this.$el.find('#the-navigation'),
            cube_url: options['cube_url'],
            scenario_url: App.SCENARIO_URL
        });

        this.chart_view = new App.ScenarioChartView({
            el: this.$el.find('#the-chart'),
            model: this.filters,
            loadstate: this.filter_loadstate,
            cube_url: options['cube_url'],
            data_revision: options['data_revision'],
            schema: options['schema'],
            scenario_chart: App.chart_library[options['schema']['chart_type']]
        });

        this.chart_controls = new App.GraphControlsView({
            el: this.$el.find('#the-chart-controls')
        });

        Backbone.history.start();

    }

});


App.create_visualization = function(container, schema) {
    App.visualization = new App.Visualization({
        el: container,
        schema: schema,
        cube_url: App.URL,
        data_revision: App.DATA_REVISION,
        scenario_url: App.SCENARIO_URL
    });
};


})(App.jQuery);
