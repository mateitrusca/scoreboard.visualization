/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.AdvancedEditor = Backbone.View.extend({

    title: "Advanced",

    template: App.get_template('editor/advanced.html'),

    initialize: function(options) {
        this.render();
    },

    render: function() {
        var value = JSON.stringify(this.model.toJSON(), null, 2);
        this.$el.html(this.template({value: value}));
    }

});


})(App.jQuery);
