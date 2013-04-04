/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.Visualization = Backbone.View.extend({

    template: App.get_template('scenario.html'),

    initialize: function(options) {
        this.$el.html(this.template());
    }

});


})(App.jQuery);
