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
        'change [name="label-horizontal-field"]': 'on_change_label'
    },

    initialize: function(options) {
        this.render();
        this.on_change_label();
    },

    render: function() {
        var x_title_item = (this.model.get('labels') || {})['title'];
        var x_title_facet_options = [];
        _(this.model.get('facets')).forEach(function(facet) {
            if(facet['type'] == 'select') {
                var item = {
                    value: facet['name'],
                    label: facet['label']
                };
                if(x_title_item) {
                    if(facet['name'] == x_title_item['facet']) {
                        item['selected'] = true;
                    }
                }
                x_title_facet_options.push(item);
            }
        });
        var x_title_field_options = [
            {value: 'label', label: 'Long labels'},
            {value: 'short_label', label: 'Short labels'}
        ];
        _(x_title_field_options).forEach(function(item) {
            if(x_title_item) {
                if(item['value'] == x_title_item['field']) {
                    item['selected'] = true;
                }
            }
        });
        var context = {
            title: {
                facet_options: x_title_facet_options,
                field_options: x_title_field_options
            }
        };
        this.$el.html(this.template(context));
    },

    on_change_label: function(evt) {
        var facet = this.$el.find('[name="label-horizontal-facet"]').val();
        var field = this.$el.find('[name="label-horizontal-field"]').val();
        var labels = _({}).extend(this.model.get('labels'));
        if(facet) {
            labels['title'] = {facet: facet, field: field};
        }
        var unit_measure = _(this.model.get('facets')).findWhere(
            {name: 'unit-measure'});
        if(unit_measure && unit_measure['type'] == 'select') {
            labels['ordinate'] = {facet: 'unit-measure', field: 'short_label'};
            labels['unit-measure'] = {facet: 'unit-measure', field: 'short_label'};
        }
        this.model.set('labels', labels);
    }

});


})(App.jQuery);
