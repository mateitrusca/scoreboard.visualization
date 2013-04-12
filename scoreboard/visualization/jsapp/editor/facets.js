/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FacetEditorField = Backbone.View.extend({

    tagName: 'tr',
    template: App.get_template('editor/facet-field.html'),

    events: {
        'change [name="type"]': 'on_change_type'
    },

    initialize: function(options) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.attr('data-name', this.model.get('name'));
    },

    on_change_type: function(evt) {
        this.model.set('type', $(evt.target).val());
    }

});


App.FacetsEditor = Backbone.View.extend({

    template: App.get_template('editor/facets.html'),

    title: "Facets",

    initialize: function(options) {
        this.facets = new Backbone.Collection();
        this.$el.html('loading...');
        var dimensions_ajax = $.get(options.cube_url + '/dimensions?flat=on');
        dimensions_ajax.done(_.bind(function(dimensions) {
            this.$el.html(this.template());
            _(dimensions).forEach(function(dimension) {
                if(dimension['type_label'] == 'dimension' ||
                   dimension['type_label'] == 'group dimension') {
                    var facet_model = new Backbone.Model({
                        'name': dimension['notation'],
                        'dimension': dimension['notation'],
                        'label': dimension['label']
                    })
                    this.facets.add(facet_model);
                    var facet_view = new App.FacetEditorField({
                        model: facet_model
                    });
                    this.$el.find('tbody').append(facet_view.el);
                }
            }, this);
            this.update();
            this.facets.on('change', this.update, this);
        }, this));
    },

    update: function() {
        var value = [];
        this.facets.forEach(function(facet) {
            value.push(facet.toJSON());
        })
        this.model.set('facets', value);
    }

});


App.FacetsEditorReadOnly = App.FacetsEditor.extend({

    title: "Facets (disabled)",

    update: function() {
        // do nothing
    }

});


})(App.jQuery);
