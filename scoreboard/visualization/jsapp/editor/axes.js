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
        'change [name="axis-sort-by"]': 'on_change',
        'change [name="axis-sort-order"]': 'on_change',
        'change [name="axis-horizontal-title"]': 'on_change',
        'change [name="axis-vertical-title"]': 'on_change'
    },

    sort_by_options: [
        {value: 'value', label: "Value"},
        {value: 'category', label: "Category"}
    ],

    sort_order_options: [
        {value: 'asc', label: "Ascending"},
        {value: 'desc', label: "Descending"}
    ],

    axis_title_options: [
        {value: 'none', label: "none"},
        {value: 'short', label: "Short label"},
        {value: 'long', label: "Long label"}
    ],

    initialize: function(options) {
        this.render();
        this.set_axis_labels();
        this.model.on('change facets', this.set_axis_labels, this);
    },

    set_axis_labels: function() {
        var unit_measure = _(this.model.get('facets')).findWhere(
            {name: 'unit-measure'});
        if(unit_measure && unit_measure['type'] == 'select') {
            var labels = _({}).extend(this.model.get('labels'));
            _(labels).extend({
                ordinate: {facet: 'unit-measure', field: 'short_label'},
                'unit-measure': {facet: 'unit-measure', field: 'short_label'}
            });
            this.model.set('labels', labels);
        }
    },

    render: function() {
        var context = {
            sort_by_options: _(this.sort_by_options).map(function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == this.model.get('axis-sort-by')) {
                    item['checked'] = true;
                }
                return item;
            }, this),
            sort_order_options: _(this.sort_order_options).map(function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == this.model.get('axis-sort-order')) {
                    item['checked'] = true;
                }
                return item;
            }, this),
            horizontal_title_options: _(this.axis_title_options).map(
                                       function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == this.model.get('axis-horizontal-title')) {
                    item['selected'] = true;
                }
                return item;
            }, this),
            vertical_title_options: _(this.axis_title_options).map(
                                       function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == this.model.get('axis-vertical-title')) {
                    item['selected'] = true;
                }
                return item;
            }, this)
        };
        this.$el.html(this.template(context));
    },

    on_change: function() {
        var val = _.bind(function(sel){return this.$el.find(sel).val()}, this);
        this.model.set({
            'axis-sort-by': val('[name="axis-sort-by"]:checked'),
            'axis-sort-order': val('[name="axis-sort-order"]:checked'),
            'axis-horizontal-title': val('[name="axis-horizontal-title"]'),
            'axis-vertical-title': val('[name="axis-vertical-title"]')
        });
    }

});


})(App.jQuery);
