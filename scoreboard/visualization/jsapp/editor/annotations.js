/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.AnnotationsEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-annotations form-inline',

    template: App.get_template('editor/annotations.html'),

    title: "Annotations",

    events: {
        'change [name="annotation"]': 'on_change_annotation',
        'change [name="title"]': 'on_change_texts',
        'change [name="notes"]': 'on_change_texts'
    },

    initialize: function(options) {
        this.annotations_model = new Backbone.Model(
            this.model.get('annotations'));
        this.annotations_model.on('change', function() {
            this.model.set('annotations', this.annotations_model.toJSON());
        }, this);
        this.render();
    },

    render: function() {
        var filters  = (this.model.get('annotations') || {})['filters'];
        var selected_facets = _(filters).pluck('name');
        var facets = [];
        this.model.facets.forEach(function(facet) {
            if(facet.get('type') == 'ignore' ||
               facet.get('dimension') == 'value') {
                return;
            }
            var item = {
                label: facet.get('label'),
                value: facet.get('name')
            };
            if(_(selected_facets).contains(facet.get('name'))) {
                item['checked'] = true;
            }
            facets.push(item);
        });
        this.$el.html(this.template({
            facets: facets,
            title: (this.annotations_model.get('title')
                    || "Definitions and scopes"),
            notes: this.annotations_model.get('notes')
        }));
    },

    on_change_annotation: function(evt) {
        var checked = this.$el.find('[name="annotation"]:checked');
        var value = _(checked).map(function(checkbox) {
            return {name: $(checkbox).val()};
        });
        this.annotations_model.set('filters', value);
    },

    on_change_texts: function() {
        this.annotations_model.set('title', this.$el.find('[name="title"]').val());
        this.annotations_model.set('notes', this.$el.find('[name="notes"]').val());
    }

});


})(App.jQuery);
