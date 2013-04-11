/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.AxesEditor = Backbone.View.extend({

    template: App.get_template('editor/axes.html'),

    title: "Axes",

    initialize: function(options) {
        this.$el.html(this.template());
    }

});


})(App.jQuery);
