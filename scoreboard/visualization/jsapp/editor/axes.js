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
        var x_title_options = [];
        _(this.model.get('facets')).forEach(function(facet) {
            if(facet['type'] == 'select') {
                x_title_options.push({
                    value: facet['name'],
                    label: facet['label']
                });
            }
        });
        var context = {
            x_title_options: x_title_options
        };
        this.$el.html(this.template(context));
    },

    on_change_label: function(evt) {
        var facet = this.$el.find('[name="label-horizontal-facet"]').val();
        var type = this.$el.find('[name="label-horizontal-type"]').val();
        this.model.set('chart_meta_labels', [
            {targets: ['x_title'], filter_name: facet, type: type}
        ]);
    }

});


})(App.jQuery);
