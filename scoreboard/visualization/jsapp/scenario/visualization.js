/*global App, Scoreboard, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.Visualization = Backbone.View.extend({

    template: App.get_template('scenario.html'),

    initialize: function(options) {
        this.$el.html(this.template());
        this.filters = new Backbone.Model();
        this.filter_loadstate = new Backbone.Model();

        if((App.initial_hash || '').substr(0, 7) == '#chart=') {
            try {
                this.filters.set(JSON.parse(App.initial_hash.substr(7)));
            } catch(e) {
                debugger;
            }
        }

        var filters_schema = [];
        var values_schema = [];
        _(options['schema']['facets']).forEach(function(item) {
            if(item['type'] == 'ignore') {
                return;
            }
            if(item['dimension'] == 'value') {
                values_schema.push(item);
                return;
            }
            filters_schema.push(item);
        });

        this.filters_box = new App.FiltersBox({
            el: this.$el.find('#the-filters'),
            model: this.filters,
            loadstate: this.filter_loadstate,
            cube_url: options['cube_url'],
            data_revision: options['data_revision'],
            schema: options['schema'],
            filters_schema: filters_schema,
            multidim: options['schema']['multidim']
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

        this.navigation = new Scoreboard.Views.ScenarioNavigationView({
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
            filters_schema: filters_schema,
            values_schema: values_schema,
            scenario_chart: App.chart_library[options['schema']['chart_type']]
        });

        this.filters.on('change', this.update_hashcfg, this);

    },

    update_hashcfg: function() {
        var hashcfg = 'chart=' + JSON.stringify(this.filters);
        this.navigation.update_hashcfg(hashcfg);
        this.share.update_url(App.SCENARIO_URL + '#' + hashcfg);
        App.update_url_hash(hashcfg);
    }

});


App.update_url_hash = function(value) {
    var base_url = window.location.href.split('#')[0];
    if(typeof(window.history.replaceState) == "function") {
        window.history.replaceState(null, '', base_url + '#' + value);
    }
    else {
        window.location.hash = value;
    }
};


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
