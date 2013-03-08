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
        this.loadstate = options['loadstate'] || new Backbone.Model();
        _(this.constraints).forEach(function(other_dimension) {
            this.model.on('change:' + other_dimension, this.update, this);
            this.loadstate.on('change:' + other_dimension, this.update, this);
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
        this.loadstate.set(this.dimension, true);
        var incomplete = false;
        var args = {'dimension': this.dimension};
        _(this.constraints).forEach(function(other_dimension) {
            var other_option = this.model.get(other_dimension);
            var other_loading = this.loadstate.get(other_dimension);
            if(other_loading || ! other_option) {
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
            this.loadstate.set(this.dimension, false);
            this.received_new_options(data['options']);
        }, this));
    },

    fetch_options: function(args) {
        return $.get(App.URL + '/dimension_values', args);
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
        App.plone_jQuery(this.$el.find("#"+this.dimension)).buttonset();
    },

    on_selection_change: function() {
        var value = this.$el.find("input:radio[checked='checked']").val();
        var key = this.dimension;
        this.model.set(key, value);
    }
});


App.FiltersBox = Backbone.View.extend({

    filter_types: {
        'select': App.SelectFilter,
        'radio': App.RadioFilter
    },

    initialize: function(options) {
        this.filters = [];
        this.loadstate = options['loadstate'] || new Backbone.Model();
        _(options['schema']['filters']).forEach(function(item) {
            var cls = this.filter_types[item['type']];
            var filter = new cls({
                model: this.model,
                loadstate: this.loadstate,
                dimension: item['dimension'],
                constraints: item['constraints']
            });
            this.filters.push(filter);
            this.$el.append(filter.el);
        }, this);
    }

});


})(App.jQuery);
