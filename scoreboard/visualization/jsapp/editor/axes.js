/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";

App.TitlePartView = Backbone.View.extend({

    events: {
        'change [name="title-part"]': 'on_change_facet_name'
    },

    template: App.get_template('editor/title-part.html'),

    initialize: function(options){
        this.facets = options.facets;
        this.render();
    },

    on_change_facet_name: function(){
        var value = this.$el.find('[name="title-part"]').val();
        this.model.set('facet_name', value);
    },

    render: function(){
        var context = {
            facets: _.chain(this.facets)
                       .where({type: "select"})
                       .map(function(facet){
                          var option = _.object([
                              ['label', facet.label],
                              ['value', facet.name]
                          ]);
                          if(this.model.get('facet_name') == facet.name) {
                              option['selected'] = true;
                          }
                          return option;
                       }, this).value()
        };
        this.$el.empty().append(this.template(context));
    }
});


App.TitlePartsCollection = Backbone.Collection.extend({

    constructor: function(parts) {
        Backbone.Collection.apply(this, parts);
    },

    get_values: function(){
        var titles = [];
        this.forEach(function(part_model){
            if (part_model.get('separator')){
                var part = [];
                part.push(part_model.get('separator'));
                part.push(part_model.get('facet_name'));
                titles.push(part);
            }
            else{
                titles.push(part_model.get('facet_name'));
            }
        });
        return titles;
    }
});


App.TitleComposer = Backbone.View.extend({

    template: App.get_template('editor/title.html'),

    initialize: function(options) {
        this.part_models = new App.TitlePartsCollection([new Backbone.Model()]);
        this.model.set('titles', this.part_models.get_values());
        this.part_models.on('change titles', this.on_change, this);
        this.part_views = _.object(this.part_models.map(function(part_model) {
            var part_view = new App.TitlePartView({
                model: part_model,
                facets: this.model.get('facets'),
                composer: this
            });
            return [part_model.cid, part_view];
        }, this));
        this.render();
    },

    on_change: function(){
        this.model.set('titles', this.part_models.get_values());
    },

    render: function(){
        this.$el.html(this.template());
        this.part_models.forEach(function(model){
            var part_view = this.part_views[model.cid];
            this.$el.find('[name="title-parts"]').empty().append(part_view.el);
            part_view.delegateEvents();
        }, this);
    }
});


App.AxesEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-axes form-inline',

    template: App.get_template('editor/axes.html'),

    title: "Axes",

    events: {
        'change [name="axis-sort-by"]': 'on_change',
        'change [name="axis-sort-order"]': 'on_change',
        'change [name="axis-sort-each-series"]': 'on_change',
        'change [name="axis-horizontal-title"]': 'on_change',
        'change [name="axis-horizontal-rotated"]': 'on_change',
        'change [name="axis-horizontal-plotline"]': 'on_change',
        'change [name="axis-vertical-title"]': 'on_change',
        'change [name="axis-vertical-plotline"]': 'on_change'
    },

    sort_by_options: [
        {value: 'value', label: "Value"},
        {value: 'category', label: "Category"}
    ],

    sort_order_options: [
        {value: 1, label: "Ascending"},
        {value: -1, label: "Descending"}
    ],

    axis_title_options: [
        {value: 'none', label: "none"},
        {value: 'short', label: "Short label"},
        {value: 'long', label: "Long label"}
    ],

    plotlines_options: [
        {value: '', label: "none"},
        {value: 'values', label: "values"}
    ],

    initialize: function(options) {
        this.title_composer = new App.TitleComposer({
            model: this.model
        });
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
        var sort = this.model.get('sort') || {};
        var plotlines = this.model.get('plotlines') || {};
        var context = {
            sort_by_options: _(this.sort_by_options).map(function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == sort['by']) {
                    item['checked'] = true;
                }
                return item;
            }, this),
            sort_order_options: _(this.sort_order_options).map(function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == sort['order']) {
                    item['checked'] = true;
                }
                return item;
            }, this),
            sort_each_series: sort['each_series'],
            horizontal_title_options: _(this.axis_title_options).map(
                                       function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == this.model.get('axis-horizontal-title')) {
                    item['selected'] = true;
                }
                return item;
            }, this),
            horizontal_rotated: this.model.get('axis-horizontal-rotated'),
            horizontal_plotline_options: _(this.plotlines_options).map(
                                          function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == plotlines['x']) {
                    item['selected'] = true;
                }
                return item;
            }),
            vertical_title_options: _(this.axis_title_options).map(
                                       function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == this.model.get('axis-vertical-title')) {
                    item['selected'] = true;
                }
                return item;
            }, this),
            vertical_plotline_options: _(this.plotlines_options).map(
                                          function(spec) {
                var item = _({}).extend(spec);
                if(spec['value'] == plotlines['y']) {
                    item['selected'] = true;
                }
                return item;
            })
        };
        this.$el.html(this.template(context));
        this.$el.find('[name="chart-titles"]').append(this.title_composer.el);
        this.title_composer.delegateEvents();
        this.title_composer.part_models.forEach(function(model){
            var part_view = this.title_composer.part_views[model.cid];
            part_view.delegateEvents();
        }, this);
    },

    on_change: function() {
        var val = _.bind(function(sel){return this.$el.find(sel).val()}, this);
        var checked = _.bind(function(sel){
            return this.$el.find(sel).is(':checked')}, this);
        var plotlines = {
            x: val('[name="axis-horizontal-plotline"]'),
            y: val('[name="axis-vertical-plotline"]')
        };
        _(['x', 'y']).forEach(function(key) {
            if(! plotlines[key]) { delete plotlines[key]; }
        });
        this.model.set({
            'sort': {
                by: val('[name="axis-sort-by"]:checked'),
                order: Number(val('[name="axis-sort-order"]:checked')) || 0,
                each_series: checked('[name="axis-sort-each-series"]')
            },
            'axis-horizontal-title': val('[name="axis-horizontal-title"]'),
            'axis-horizontal-rotated': checked('[name="axis-horizontal-rotated"]'),
            'axis-vertical-title': val('[name="axis-vertical-title"]'),
            'plotlines': plotlines
        });
    }

});


})(App.jQuery);
