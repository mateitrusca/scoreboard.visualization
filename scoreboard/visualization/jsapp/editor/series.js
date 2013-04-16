/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.SeriesEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'form-inline',

    template: App.get_template('editor/series.html'),

    title: "Series",

    initialize: function(options) {
        this.$el.html(this.template());
    }

});


})(App.jQuery);
