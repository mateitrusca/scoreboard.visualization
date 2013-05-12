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
        var x_title_item = null;
        _(this.model.get('chart_meta_labels')).forEach(function(item) {
            if(_(item.targets).contains('x_title')) {
                x_title_item = item;
            }
        });
        var x_title_facet_options = [];
        _(this.model.get('facets')).forEach(function(facet) {
            if(facet['type'] == 'select') {
                var item = {
                    value: facet['name'],
                    label: facet['label']
                };
                if(x_title_item) {
                    if(facet['name'] == x_title_item['filter_name']) {
                        item['selected'] = true;
                    }
                }
                x_title_facet_options.push(item);
            }
        });
        var x_title_label_options = [
            {value: 'label', label: 'Long labels'},
            {value: 'short_label', label: 'Short labels'}
        ];
        _(x_title_label_options).forEach(function(item) {
            if(x_title_item) {
                if(item['value'] == x_title_item['type']) {
                    item['selected'] = true;
                }
            }
        });
        var context = {
            x_title: {
                facet_options: x_title_facet_options,
                label_options: x_title_label_options
            }
        };
        this.$el.html(this.template(context));
    },

    on_change_label: function(evt) {
        var facet = this.$el.find('[name="label-horizontal-facet"]').val();
        var type = this.$el.find('[name="label-horizontal-type"]').val();
        var chart_meta_labels = [];
        if(facet) {
            chart_meta_labels.push({
                targets: ['x_title'],
                filter_name: facet,
                type: type
            });
        }
        var unit_measure = _(this.model.get('facets')).findWhere(
            {name: 'unit-measure'});
        if(unit_measure && unit_measure['type'] == 'select') {
            chart_meta_labels.push({
                targets: ['y_title', 'unit-measure'],
                filter_name: 'unit-measure',
                type: 'short_label'
            });
        }
        this.model.set('chart_meta_labels', chart_meta_labels);
    }

});


})(App.jQuery);
