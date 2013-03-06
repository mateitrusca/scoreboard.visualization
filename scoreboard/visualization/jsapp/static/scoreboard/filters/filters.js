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

    received_new_options: function(new_options) {
        this.dimension_options = new_options;
        this.render();
        this.model.set(this.dimension, new_options[0]['notation']);
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
            this.received_new_options(data['options']);
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

App.RadioFilter = App.SelectFilter.extend({
    template: App.get_template('scoreboard/filters/radio_buttons.html'),

    events: {
        'change input:radio': 'on_selection_change'
    },

    render: function() {
        this.$el.html(this.template({
            'dimension_options': this.dimension_options,
            'dimension_id': this.dimension
        }));
    },

    on_selection_change: function() {
        var value = this.$el.find("input:radio[checked='checked']").attr('id');
        var key = this.dimension;
        this.model.set(key, value);
    }
});

})(App.jQuery);
