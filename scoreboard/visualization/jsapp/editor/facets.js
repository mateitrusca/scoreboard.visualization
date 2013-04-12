/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FacetsEditor = Backbone.View.extend({

    template: App.get_template('editor/facets.html'),

    events: {
        'change [name="type"]': 'on_change_type'
    },

    title: "Facets",

    initialize: function(options) {
        this.facets = new Backbone.Collection();
        this.$el.html('loading...');
        var dimensions_ajax = $.get(options.cube_url + '/dimensions?flat=on');
        dimensions_ajax.done(_.bind(function(dimensions) {
            _(dimensions).forEach(function(dimension) {
                if(dimension['type_label'] == 'dimension' ||
                   dimension['type_label'] == 'group dimension') {
                    this.facets.add(new Backbone.Model({
                        'name': dimension['notation'],
                        'dimension': dimension['notation'],
                        'label': dimension['label']
                    }));
                }
            }, this);
            this.update();
            this.$el.html(this.template({
                'facets': this.facets.toJSON()
            }));
        }, this));
    },

    update: function() {
        var value = [];
        this.facets.forEach(function(facet) {
            value.push(facet.toJSON());
        })
        this.model.set('facets', value);
    },

    on_change_type: function(evt) {
        var select = $(evt.target);
        var name = select.data('facet');
        var type = select.val();
        this.facets.where({'name': name})[0].set('type', type);
        this.update();
    }

});


App.FacetsEditorReadOnly = App.FacetsEditor.extend({

    title: "Facets (disabled)",

    update: function() {
        // do nothing
    }

});


})(App.jQuery);
