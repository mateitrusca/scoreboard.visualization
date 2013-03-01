/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.SelectFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    events: {
        'change select': 'on_selection_change'
    },

    initialize: function(options) {
        this.dimension = options['dimension'];
        this.constraints = options['constraints'] || [];
        _(this.constraints).forEach(function(other_dimension) {
            this.model.on('change:' + other_dimension, this.update, this);
        }, this);
        this.update();
    },

    update: function() {
        // TODO abort any existing requests
        // TODO render greyed-out interface
        var args = {'dimension': this.dimension};
        _(this.constraints).forEach(function(other_dimension) {
            var other_option = this.model.get(other_dimension);
            if(other_option) {
                args[other_dimension] = other_option;
            }
        }, this);
        var ajax = $.get(App.URL + '/filter_options', args);
        ajax.done(_.bind(function(data) {
            this.dimension_options = data['options'];
            this.render();
        }, this));
    },

    render: function() {
        this.$el.html(this.template({
            'dimension_options': this.dimension_options
        }));
    },

    on_selection_change: function() {
        var value = this.$el.find('select').val();
        var key = this.dimension;
        this.model.set(key, value);
    }

});


})(App.jQuery);
