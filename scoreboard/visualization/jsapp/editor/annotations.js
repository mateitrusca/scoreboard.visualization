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
        'change [name="annotation"]': 'on_change_annotation'
    },

    initialize: function(options) {
        this.render();
    },

    render: function() {
        var filters  = (this.model.get('annotations') || {})['filters'];
        var selected_facets = _(filters).pluck('name');
        var facets = [];
        _(this.model.get('facets')).forEach(function(facet) {
            if(facet['type'] == 'ignore' || facet['dimension'] == 'value') {
                return;
            }
            var item = {
                label: facet['label'],
                value: facet['name']
            };
            if(_(selected_facets).contains(facet['name'])) {
                item['checked'] = true;
            }
            facets.push(item);
        });
        this.$el.html(this.template({
            facets: facets
        }));
    },

    on_change_annotation: function(evt) {
        var checked = this.$el.find('[name="annotation"]:checked');
        var value = _(checked).map(function(checkbox) {
            return {name: $(checkbox).val()};
        });
        this.model.set('annotations', {filters: value});
    }

});


})(App.jQuery);
