/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.SelectFilter = Backbone.View.extend({

    template: App.get_template('filters/dropdown.html'),

    events: {
        'change select': 'on_selection_change'
    },

    initialize: function(options) {
        this.cube_url = options['cube_url'];
        this.data_revision = options['data_revision'] || '';
        this.name = options['name'];
        this.label = options['label'];
        this.dimension = options['dimension'];
        this.xy = options['xy'] || false;
        this.constraints = options['constraints'] || [];
        this.dimension_options = [];
        this.ajax = null;
        this.default_value = options['default_value'];
        this.default_all = options['default_all'] || false;
        this.loadstate = options['loadstate'] || new Backbone.Model();
        _(this.constraints).forEach(function(other_name, other_dimension) {
            this.model.on('change:' + other_name, this.update, this);
            this.loadstate.on('change:' + other_name, this.update, this);
        }, this);
        this.position = options['position'];
        this.update();
    },

    adjust_value: function() {
        var range = _(this.dimension_options).pluck('notation');
        if(! _(range).contains(this.model.get(this.name))) {
            var default_value = this.default_value || range[0];
            this.model.set(this.name, default_value);
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
            this.dimension_options = _(data['options']).sortBy(function(item){
                return item['notation']
            });
            this.adjust_value();
            this.render();
            this.loadstate.set(this.name, false);
        }, this));
    },

    fetch_options: function(args) {
        var view_name = this.xy ? 'dimension_values_xy' : 'dimension_values';
        args = _({rev: this.data_revision}).extend(args);
        return $.get(this.cube_url + '/' + view_name, args);
    },

    render: function() {
        var selected_value = this.model.get(this.name);
        var options = _(this.dimension_options).map(function(item) {
            var selected = (item['notation'] == selected_value);
            return _({'selected': selected}).extend(item);
        });
        this.$el.html(this.template({
            'dimension_options': options,
            'filter_label': this.label
        }));
    },

    on_selection_change: function() {
        var value = this.$el.find('select').val();
        var key = this.name;
        this.model.set(key, value);
    }

});


App.MultipleSelectFilter = App.SelectFilter.extend({

    template: App.get_template('filters/multiple_select.html'),

    events: _({
        'click input[type="button"][id$="-add-all"]': 'add_all',
        'click input[type="button"][id$="-clear"]': 'clear'
    }).extend(App.SelectFilter.prototype.events),

    adjust_value: function() {
        var current_value = this.model.get(this.name);
        var range = _(this.dimension_options).pluck('notation');
        if(_.intersection(range, current_value).length == 0){
            if(this.default_all){
                this.model.set(this.name, range);
            }
            else{
                var default_value = this.default_value || [range[0]];
                this.model.set(this.name, default_value);
            }
        }
    },

    render: function() {
        var selected_value = this.model.get(this.name);
        var options = _(this.dimension_options).map(function(item) {
            var selected = (item['notation'] == selected_value);
            return _({'selected': selected}).extend(item);
        });
        this.$el.html(this.template({
            'dimension_options': options,
            'filter_label': this.label,
            'filter_name': this.name
        }));
        this.$el.find('select').select2();
        this.$el.find('select').select2("val", this.model.get(this.name));
    },

    add_all: function() {
        var all = _(this.dimension_options).pluck('notation');
        this.model.set(this.name, []);
        $(this.$el.find('select')).select2("val", "");
        this.model.set(this.name, all);
        $(this.$el.find('select')).select2("val", all);
    },

    clear: function() {
        this.$el.find('select').select2("val", "");
        this.model.set(this.name, []);
    }

});


App.FiltersBox = Backbone.View.extend({

    filter_types: {
        'select': App.SelectFilter,
        'multiple_select': App.MultipleSelectFilter,
        'radio': App.RadioFilter
    },

    initialize: function(options) {
        this.filters = [];
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.cube_url = options['cube_url'];
        this.data_revision = options['data_revision'] || '';
        _(options['schema']['filters']).forEach(function(item) {
            var cls = this.filter_types[item['type']];
            var filter = new cls({
                model: this.model,
                loadstate: this.loadstate,
                cube_url: this.cube_url,
                data_revision: this.data_revision,
                xy: item['xy'],
                name: item['name'],
                label: item['label'],
                default_all: item['default_all'],
                dimension: item['dimension'],
                position: item['position'],
                constraints: item['constraints']
            });
            this.filters.push(filter);
            if(filter.position){
                $(filter.el).appendTo($(filter.position, this.$el));
            }
            else{
                $(filter.el).appendTo($('.left_column', this.$el));
            }
        }, this);
    }

});


})(App.jQuery);
