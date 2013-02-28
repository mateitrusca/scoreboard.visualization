/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.IndicatorFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    dimension: 'http://semantic.digital-agenda-data.eu/def/property/indicator',

    initialize: function(options) {
        var args = {'dimension': this.dimension};
        var ajax = $.get(App.URL + '/filter_values', args);
        var view = this;
        ajax.done(function(data) {
            view.options = data['values'];
            view.render();
        });
    },

    render: function() {
        this.$el.html(this.template({'options': this.options}));
    }

});


})(App.jQuery);
