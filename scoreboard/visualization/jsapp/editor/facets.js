/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FacetEditorField = Backbone.View.extend({

    tagName: 'tr',
    template: App.get_template('editor/facet-field.html'),

    events: {
        'change [name="type"]': 'on_input_change',
        'change [name="on_client"]': 'on_input_change'
    },

    type_options: [
        {value: 'select', label: "select filter"},
        {value: 'multiple_select', label: "multiple select filter"},
        {value: 'all-values', label: "all values as series"},
        {value: 'data-column', label: "datapoints"}
    ],

    initialize: function(options) {
        this.render();
    },

    render: function() {
        var context = _({
            'type_options': _(this.type_options).map(function(opt) {
                var selected = this.model.get('type') == opt['value'];
                return _({
                    selected: selected
                }).extend(opt);
            }, this)
        }).extend(this.model.toJSON());
        this.$el.html(this.template(context));
        this.$el.attr('data-name', this.model.get('name'));
    },

    on_input_change: function(evt) {
        this.model.set({
            type: this.$el.find('[name="type"]').val(),
            on_client: this.$el.find('[name="on_client"]').is(':checked')
        });
    }

});


App.FacetsEditor = Backbone.View.extend({

    template: App.get_template('editor/facets.html'),

    title: "Facets",

    initialize: function(options) {
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
        this.facets.on('change', this.save_value, this);
        this.save_value();
        this.render();
    },

    render: function() {
        if(! this.dimensions) {
            this.$el.html('loading...');
            return;
        }
        this.$el.html(this.template());
        this.facets.forEach(function(facet_model) {
            var facet_view = this.facet_views[facet_model.cid];
            this.$el.find('tbody').append(facet_view.el);
        }, this);
    },

    save_value: function() {
        var value = [];
        this.facets.forEach(function(facet) {
            value.push(facet.toJSON());
        });
        this.model.set('facets', value);
    }

});


})(App.jQuery);
