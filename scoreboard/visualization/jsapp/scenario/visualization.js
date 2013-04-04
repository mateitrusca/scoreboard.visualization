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
    }

});


})(App.jQuery);
