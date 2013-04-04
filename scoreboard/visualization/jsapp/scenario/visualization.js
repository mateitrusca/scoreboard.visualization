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
    }

});


})(App.jQuery);
