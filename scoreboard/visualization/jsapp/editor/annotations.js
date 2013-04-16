/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.AnnotationsEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'form-inline',

    template: App.get_template('editor/annotations.html'),

    title: "Annotations",

    initialize: function(options) {
        this.$el.html(this.template());
    }

});


})(App.jQuery);
