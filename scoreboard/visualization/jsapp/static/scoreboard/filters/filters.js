/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";

var dad_prop = 'http://semantic.digital-agenda-data.eu/def/property/';


App.IndicatorFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    dimension: dad_prop + 'indicator',

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


App.YearFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    dimension: dad_prop + 'time-period',

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
