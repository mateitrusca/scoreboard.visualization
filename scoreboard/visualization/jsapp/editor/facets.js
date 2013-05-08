/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FacetEditorField = Backbone.View.extend({

    tagName: 'tr',
    className: 'editor-facets',
    template: App.get_template('editor/facet-field.html'),

    events: {
        'change [name="type"]': 'on_change_type',
        'click .facet-sort': 'on_click_sort',
        'change [name="include_wildcard"]': 'on_change_wildcard'
    },

    type_options: [
        {value: 'select', label: "single selection"},
        {value: 'multiple_select', label: "multiple selection"},
        {value: 'all-values', label: "all values"},
        {value: 'ignore', label: "ignore"}
    ],

    initialize: function(options) {
        if(! this.model.has('type')) {
            this.model.set('type', this.type_options[0]['value']);
        }
        this.render();
    },

    render: function() {
        var context = _({
            'type_options': _(this.type_options).map(function(opt) {
                var selected = this.model.get('type') == opt['value'];
                return _({
                    selected: selected
                }).extend(opt);
            }, this),
            'is_single_select': (this.model.get('type') == 'select')
        }).extend(this.model.toJSON());
        this.$el.html(this.template(context));
        this.$el.attr('data-name', this.model.get('name'));
    },

    on_change_type: function(evt) {
        this.model.set({
            type: this.$el.find('[name="type"]').val()
        });
    },

    on_click_sort: function(evt) {
        evt.preventDefault();
        var direction = $(evt.target).data('sort-direction');
        var idx = this.model.collection.indexOf(this.model);
        var new_idx = idx + (direction == 'down' ? +1 : -1);
        if(new_idx < 0) { new_idx = 0; }
        this.model.collection.move(this.model, new_idx);
    },

    on_change_wildcard: function(evt) {
        if($(evt.target).is(':checked')) {
            this.model.set('include_wildcard', true);
        }
        else {
            this.model.unset('include_wildcard');
        }
    }

});


App.FacetsEditor = Backbone.View.extend({

    template: App.get_template('editor/facets.html'),

    title: "Facets",

    events: {
        'change [name="multiple_series"]': 'on_multiple_series_change'
    },

    initialize: function(options) {
        if(! this.model.has('multiple_series')) {
            this.model.set('multiple_series', null);
        }
        this.render();
        this.get_dimensions();
    },

    get_dimensions: function() {
        var dimensions_url = this.options.cube_url + '/dimensions?flat=on';
        $.get(dimensions_url).done(_.bind(function(dimensions) {
            this.dimensions = dimensions;
            this.load_value();
        }, this));
    },

    load_value: function() {
        this.facets = new Backbone.Collection(this.model.get('facets'));
        this.facet_views = {};
        var add_model = _.bind(function(name, defaults) {
            var facet_model = this.facets.findWhere({name: name});
            if(! facet_model) {
                facet_model = new Backbone.Model({'name': name});
                facet_model.set(defaults);
            }
            this.facets.add(facet_model);
            var facet_view = new App.FacetEditorField({model: facet_model});
            this.facet_views[facet_model.cid] = facet_view;
        }, this);
        _(this.dimensions).forEach(function(dimension) {
            if(dimension['type_label'] != 'dimension' &&
               dimension['type_label'] != 'dimension group') {
                return;
            }
            var name = dimension['notation'];
            add_model(name, {
                'dimension': name,
                'label': dimension['label']
            });
        }, this);
        this.facets.forEach(function(facet) {
            if(! this.facet_views[facet.cid]) {
                this.facets.remove(facet);
            }
        }, this);
        this.facets.on('change sort', this.apply_changes, this);
        this.apply_changes();
    },

    compute_facet_roles: function() {
        var series_options = [];
        var no_multiple_series = true;
        var free_dimensions = [];
        var facets_above = {};
        this.facets.forEach(function(facet_model) {
            facet_model.set('constraints', _({}).extend(facets_above));
            var facet = facet_model.toJSON();
            var name = facet['name'];
            if(facet['type'] == 'multiple_select' ||
               facet['type'] == 'all-values') {
                var option = _({}).extend(facet);
                if(name == this.model.get('multiple_series')) {
                    option['selected'] = true;
                    no_multiple_series = false;
                }
                else {
                    free_dimensions.push(option);
                }
                series_options.push(option);
            }
            else if(facet['type'] != 'ignore') {
                facets_above[name] = name;
            }
        }, this);
        if(no_multiple_series) {
            this.model.set('multiple_series', null);
        }
        this.facet_roles = {
            series_options: series_options,
            err_too_few: (free_dimensions.length < 1),
            err_too_many: (free_dimensions.length > 1),
            category_facet: (free_dimensions.length == 1
                             ? free_dimensions[0]
                             : null)
        }
    },

    render: function() {
        if(! this.dimensions) {
            this.$el.html('loading...');
            return;
        }
        var context = {
            series_options: this.facet_roles.series_options,
            err_too_few: this.facet_roles.err_too_few,
            err_too_many: this.facet_roles.err_too_many,
            category_facet: this.facet_roles.category_facet
        };
        this.$el.html(this.template(context));
        this.facets.forEach(function(facet_model) {
            var facet_view = this.facet_views[facet_model.cid];
            facet_view.render();
            this.$el.find('tbody').append(facet_view.el);
            facet_view.delegateEvents();
        }, this);
    },

    save_value: function() {
        var value = [];
        this.facets.forEach(function(facet) {
            value.push(facet.toJSON());
        });
        value.push({type: 'all-values', dimension: 'value'});
        this.model.set('facets', value);
        var category_facet = this.facet_roles.category_facet;
        if(category_facet) {
            this.model.set('category_facet', category_facet['name']);
        }
    },

    apply_changes: function() {
        this.compute_facet_roles();
        this.save_value();
        this.render();
    },

    on_multiple_series_change: function() {
        var select = this.$el.find('[name="multiple_series"]');
        this.model.set('multiple_series', select.val() || null);
        this.apply_changes();
    }

});


})(App.jQuery);
