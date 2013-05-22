/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";

App.groupers =  {
    'indicator': 'indicator-group',
    'breakdown': 'breakdown-group'
};


App.SelectFilter = Backbone.View.extend({

    template: App.get_template('filters/dropdown.html'),

    simple_template: App.get_template('filters/dropdown.html'),

    group_template: App.get_template('filters/dropdown_with_groups.html'),

    events: {
        'change select': 'on_selection_change'
    },

    initialize: function(options) {
        this.cube_url = options['cube_url'];
        this.data_revision = options['data_revision'] || '';
        this.name = options['name'];
        this.label = options['label'];
        this.dimension = options['dimension'];
        this.chart_type = options['chart_type'];
        this.chart_subtype = options['chart_subtype'];
        this.sortBy = options['sortBy'] || 'notation';
        this.sortOrder = options['sortOrder'];
        this.multidim = options['multidim'];
        this.constraints = options['constraints'] || [];
        this.dimension_options = [];
        this.ajax = null;
        this.default_value = options['default_value'];
        this.ignore_values = options['ignore_values'];
        this.default_all = options['default_all'] || false;
        this.loadstate = options['loadstate'] || new Backbone.Model();
        _(this.constraints).forEach(function(other_name, other_dimension) {
            this.model.on('change:' + other_name, this.update, this);
            this.loadstate.on('change:' + other_name, this.update, this);
        }, this);
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
            if(other_option == 'any' && App.groupers[this.dimension] == other_dimension){
                this.display_in_groups = true;
            }
            else{
                this.display_in_groups = false;
            }
        }, this);
        if(incomplete) {
            this.$el.html("--");
            return;
        }
        this.$el.html("-- loading --");
        this.ajax = this.fetch_options(args);
        this.ajax.done(_.bind(function(data) {
            this.ajax = null;
            if (this.options.include_wildcard){
                _(data['options']).push(
                    _.object([
                        ['group_notation', null],
                        ['label', 'Any'],
                        ['short_label', 'Any'],
                        ['notation', 'any'],
                        ['uri', null]
                    ]
                ));
            }

            // Sort items
            var sortBy = this.sortBy;
            if(this.sortOrder === 'reverse'){
                this.dimension_options = _(data['options']).sortBy(function(item){
                    return item[sortBy];
                }).reverse();
            }else if(this.sortOrder === 'nosort'){
                this.dimension_options = data[options];
            }else{
                this.dimension_options = _(data['options']).sortBy(function(item){
                    return item[sortBy];
                });
            }

            this.options_labels = {};
            _(this.dimension_options).each(function(opt){
                  if (opt['notation'] != 'any'){
                      _(this.options_labels).extend(
                          _.object([[opt['notation'], opt]]));
                  }
            }, this);
            this.adjust_value();
            this.render();
            this.loadstate.set(this.name, false);
        }, this));
    },

    fetch_options: function(args) {
        var view_name = '';
        if(this.multidim == 3) {
            view_name = 'dimension_options_xyz';
        }
        else if(this.multidim == 2) {
            view_name = 'dimension_options_xy';
        }
        else if(this.chart_type === 'country_profile'){
            args.subtype = this.chart_subtype;
            view_name = 'dimension_options_cp';
        }
        else {
            view_name = 'dimension_options';
        }
        var relevant_args = {}
        _(args).each(function(value, key){
            if (value!='any'){
                var pair = _.object([[key, value]]);
                _(relevant_args).extend(pair);
            }
        });
        relevant_args['rev'] = this.data_revision;
        return $.getJSON(this.cube_url + '/' + view_name, relevant_args);
    },

    render: function() {
        var selected_value = this.model.get(this.name);
        var options = _(this.dimension_options).map(function(item) {
            var selected = (item['notation'] == selected_value);
            return _({'selected': selected}).extend(item);
        });
        var template_data = {
            'dimension_options': options,
            'filter_label': this.label
        }
        if (this.display_in_groups){
            var grouped_data = _(this.dimension_options).groupBy('group_notation');
            var groups = _.zip(_(grouped_data).keys(), _(grouped_data).values())
            var grouper = _.chain(App.visualization.filters_box.filters).
              findWhere({name: App.groupers[this.name]}).value();
            template_data['groups'] = _.chain(groups).map(function(item){
                var label = grouper.options_labels[item[0]].short_label ||
                            grouper.options_labels[item[0]].label;
                var out = _.object(['group', 'options'],
                                   [label, item[1]]);
                return out;
            }).sortBy('group').value();
            this.$el.html(this.group_template(template_data));
        }
        else{
            this.$el.html(this.simple_template(template_data));
        }
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


App.AllValuesFilter = App.SelectFilter.extend({

    render: function() {
        this.$el.html("");
    },

    adjust_value: function() {
        var adjusted_values = _.chain(this.dimension_options)
                               .pluck('notation')
                               .difference(this.ignore_values)
                               .value();
        this.model.set(this.name, adjusted_values);
    }

});


App.FiltersBox = Backbone.View.extend({

    filter_types: {
        'select': App.SelectFilter,
        'multiple_select': App.MultipleSelectFilter,
        'all-values': App.AllValuesFilter
    },

    initialize: function(options) {
        this.filters = [];
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.cube_url = options['cube_url'];
        this.data_revision = options['data_revision'] || '';
        var schema = options['schema'];
        _(options['filters_schema']).forEach(function(item) {
            var cls = this.filter_types[item['type']];
            var default_all = (item['name'] == schema['category_facet']) && !item['default_value'];
            var filter = new cls({
                model: this.model,
                loadstate: this.loadstate,
                cube_url: this.cube_url,
                data_revision: this.data_revision,
                chart_type: schema['chart_type'],
                chart_subtype: schema['chart_subtype'],
                sortBy: item['sortBy'],
                sortOrder: item['sortOrder'],
                multidim: item['multidim_common'] ? options['multidim'] : null,
                name: item['name'],
                label: item['label'],
                default_value: item['default_value'],
                ignore_values: item['ignore_values'],
                default_all: default_all,
                dimension: item['dimension'],
                include_wildcard: item['include_wildcard'],
                constraints: item['constraints']
            });
            // TODO: temporary fix until default_value is present in the configurator
            if (item['type'] == 'multiple_select' && filter.name == 'ref-area' && !filter.default_value) {
                if ( filter.chart_type == 'lines' ) {
                    filter.default_value = ['EU27'];
                } else {
                    filter.default_value = ['EU27', 'BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'UK'];
                }
            }
            this.filters.push(filter);
            if(item.position == 'upper-right' || item.type == 'multiple_select'){
                $(filter.el).appendTo($('.upper-right', this.$el));
            }
            else if(item.position == 'bottom-left'){
                $(filter.el).appendTo($('.bottom-left', this.$el));
            }
            else if(item.position == 'bottom-right'){
                $(filter.el).appendTo($('.bottom-right', this.$el));
            }
            else{
                $(filter.el).appendTo($('.upper-left', this.$el));
            }
        }, this);
    }

});


})(App.jQuery);
