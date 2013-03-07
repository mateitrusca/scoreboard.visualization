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
        this.dimension_options = [];
        this.ajax = null;
        _(this.constraints).forEach(function(other_dimension) {
            this.model.on('change:' + other_dimension, this.update, this);
        }, this);
        this.update();
    },

    received_new_options: function(new_options) {
        this.dimension_options = new_options;
        this.render();
        if(new_options.length > 0) {
            this.model.set(this.dimension, new_options[0]['notation']);
        }
    },

    update: function() {
        if(this.ajax) {
            this.ajax.abort();
            this.ajax = null;
        }
        var incomplete = false;
        var args = {'dimension': this.dimension};
        _(this.constraints).forEach(function(other_dimension) {
            var other_option = this.model.get(other_dimension);
            if(! other_option) {
                incomplete = true;
            }
            args[other_dimension] = other_option;
        }, this);
        if(incomplete) {
            this.$el.html("--");
            return;
        }
        this.$el.html("-- loading --");
        this.ajax = this.fetch_options(args);
        this.ajax.done(_.bind(function(data) {
            this.ajax = null;
            this.received_new_options(data['options']);
        }, this));
    },

    fetch_options: function(args) {
        return $.get(App.URL + '/filter_options', args);
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
