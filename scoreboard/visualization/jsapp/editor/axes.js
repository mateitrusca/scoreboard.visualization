/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.AxesEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-axes form-inline',

    template: App.get_template('editor/axes.html'),

    title: "Axes",

    events: {
        'change [name="label-horizontal-facet"]': 'on_change_label',
        'change [name="label-horizontal-type"]': 'on_change_label'
    },

    initialize: function(options) {
        this.render();
        this.on_change_label();
    },

    render: function() {
        var x_title_facet_options = [];
        _(this.model.get('facets')).forEach(function(facet) {
            if(facet['type'] == 'select') {
                var item = {
                    value: facet['name'],
                    label: facet['label']
                };
                x_title_facet_options.push(item);
            }
        });
        var context = {
            x_title: {
                facet_options: x_title_facet_options
            }
        };
        this.$el.html(this.template(context));
    },

    on_change_label: function(evt) {
        var facet = this.$el.find('[name="label-horizontal-facet"]').val();
        var type = this.$el.find('[name="label-horizontal-type"]').val();
        this.model.set('chart_meta_labels', [
            {targets: ['x_title'],
             filter_name: facet,
             type: type},
            {targets: ['y_title', 'unit-measure'],
             filter_name: 'unit-measure',
             type: 'short_label'}
        ]);
    }

});


})(App.jQuery);
