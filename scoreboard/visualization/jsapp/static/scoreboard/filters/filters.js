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
        this.name = options['name'];
        this.dimension = options['dimension'];
        this.xy = options['xy'] || false;
        this.constraints = options['constraints'] || [];
        this.dimension_options = [];
        this.ajax = null;
        this.loadstate = options['loadstate'] || new Backbone.Model();
        _(this.constraints).forEach(function(other_name, other_dimension) {
            this.model.on('change:' + other_name, this.update, this);
            this.loadstate.on('change:' + other_name, this.update, this);
        }, this);
        this.update();
    },

    received_new_options: function(new_options) {
        this.dimension_options = new_options;
        this.render();
        if(new_options.length > 0) {
            this.model.set(this.name, new_options[0]['notation']);
        }
    },

    update: function() {
        if(this.ajax) {
            this.ajax.abort();
            this.ajax = null;
        }
        this.loadstate.set(this.name, true);
        var incomplete = false;
        var args = {'dimension': this.dimension};
        _(this.constraints).forEach(function(other_name, other_dimension) {
            var other_option = this.model.get(other_name);
            var other_loading = this.loadstate.get(other_name);
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
            this.loadstate.set(this.name, false);
            this.received_new_options(data['options']);
            if(_.contains(['indicator', 'unit-measure'], this.dimension)){
                App[this.dimension + '_labels'] = _.map(data['options'],
                    function(item){
                        return {
                            'id': item.notation,
                            'label': item.label,
                            'short_label': item.short_label
                        }
                    }
                );
            }
        }, this));
    },

    fetch_options: function(args) {
        var view_name = this.xy ? 'dimension_values_xy' : 'dimension_values';
        return $.get(App.URL + '/' + view_name, args);
    },

    render: function() {
        this.$el.html(this.template({
            'dimension_options': this.dimension_options
        }));
    },

    on_selection_change: function() {
        var value = this.$el.find('select').val();
        var key = this.name;
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
            'name': this.name
        }));
        App.plone_jQuery(this.$el.find('.radio-filter-container')).buttonset();
    },

    on_selection_change: function() {
        var value = this.$el.find("input:radio[checked='checked']").val();
        var key = this.name;
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
                name: item['name'],
                dimension: item['dimension'],
                constraints: item['constraints']
            });
            this.filters.push(filter);
            this.$el.append(filter.el);
        }, this);
    }

});


})(App.jQuery);
