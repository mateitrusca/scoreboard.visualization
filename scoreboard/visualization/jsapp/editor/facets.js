/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FacetEditorField = Backbone.View.extend({

    tagName: 'tr',
    className: 'editor-facets',
    template: App.get_template('editor/facet-field.html'),

    events: {
        'input [name="label"]': 'on_input_label',
        'keyup [name="label"]': 'on_input_label',
        'focusout [name="label"]': 'on_focusout_label',
        'change [name="position"]': 'on_change_position',
        'change [name="type"]': 'on_change_type',
        'click .facet-sort': 'on_click_sort',
        'change [name="include_wildcard"]': 'on_change_wildcard',
        'change [name="multidim"]': 'on_change_multidim',
        'change [name="sort-by"]': 'on_change_sorting',
        'change [name="sort-order"]': 'on_change_sorting',
        'change [name="default_value"]': 'on_change_default_value',
        'change [name="ignore_values"]': 'on_change_ignore_values'
    },

    fetch_options: function(){
        var args = {};
        args['dimension'] = this.model.get('dimension');
        args['rev'] = App.DATA_REVISION;
        var view_name = 'dimension_options';
        return $.getJSON(App.URL + '/' + view_name, args);
    },

    position_options:[
        {value: 'upper-left', label: "upper left"},
        {value: 'upper-right', label: "upper right"},
        {value: 'bottom-left', label: "lower left"},
        {value: 'bottom-right', label: "lower right"}
    ],

    type_options: [
        {value: 'select', label: "single selection"},
        {value: 'multiple_select', label: "multiple selection"},
        {value: 'all-values', label: "all values"},
        {value: 'ignore', label: "ignore"}
    ],

    sort_by_options: [
        {value: 'nosort', label: "order field"},
        {value: 'label', label: "label"},
        {value: 'short_label', label: "short label"},
        {value: 'notation', label: "code"}
    ],

    sort_order_options: [
        {value: 'asc', label: "ascending"},
        {value: 'reverse', label: "descending"}
    ],

    initialize: function(options) {
        if(! this.model.has('type')) {
            this.model.set('type', this.type_options[0]['value']);
        }
        this.facets_editor = options['facets_editor'];
        var ajax = this.fetch_options();

        ajax.done(_.bind(function(data){
            options = [];
            _(data.options).each(function(item){
                options.push({
                    label: item['label'],
                    value: item['notation']
                });
            });
            this.facet_options = options;
            this.trigger('options_received',
                this.model.get('dimension'),
                this
            );
            this.render();
        },this));

        this.render();
    },

    render: function() {
        var context = _({
            facet_label: this.model.get('label'),
            facet_options: _(this.facet_options).map(function(opt) {
                if (_(this.model.get('default_value')).contains(opt['value'])) {
                    return _({"default": true}).extend(opt);
                }
                return opt;
            }, this),
            position_options:_(this.position_options).map(function(opt) {
                var selected = (this.model.get('position') == opt['value']);
                return _({
                    selected: selected
                }).extend(opt);
            }, this),
            type_options: _(this.type_options).map(function(opt) {
                var selected = this.model.get('type') == opt['value'];
                return _({
                    selected: selected
                }).extend(opt);
            }, this),
            sort_by_options: _(this.sort_by_options).map(function(spec) {
                var opt = _({}).extend(spec);
                if(spec['value'] == this.model.get('sortBy')) {
                    opt['selected'] = true;
                }
                return opt;
            }, this),
            sort_order_options: _(this.sort_order_options).map(function(spec) {
                var opt = _({}).extend(spec);
                if(spec['value'] == this.model.get('sortOrder')) {
                    opt['selected'] = true;
                }
                return opt;
            }, this),
            is_single_select: (this.model.get('type') == 'select'),
            chart_is_multidim: this.facets_editor.chart_is_multidim()
        }).extend(this.model.toJSON());
        this.$el.html(this.template(context));
        this.$el.attr('data-name', this.model.get('name'));
        var params = {
            placeholder: "Select value",
            allowClear: true
        }
        this.$el.find('[name="ignore_values"]').select2(params);
        if (this.model.get('type') == 'select'){
            params['maximumSelectionSize'] = 1;
        }
        this.$el.find('[name="default_value"]').select2(params);
    },

    on_input_label: function(evt) {
        if (this.facet_label == this.$el.find('[name="label"]').val()){
            return;
        }
        this.facet_label = this.$el.find('[name="label"]').val() ||
                          this.model.get('label');
    },

    on_focusout_label: function(evt) {
        this.model.set({
            label: this.facet_label || this.model.get('label')
        });
    },

    on_change_position: function(evt) {
        this.model.set({
            position: this.$el.find('[name="position"]').val()
        });
    },

    on_change_default_value: function(evt) {
        var value = this.$el.find('[name="default_value"]').val();
        var result = [];
        _(this.facet_options).each(function(opt){
            opt['default'] = false;
            if (_(value).contains(opt.value)){
                opt['default'] = true;
                result.push(opt.value);
            }
        })
        if (result.length > 0){
            if (this.model.get('type') == 'select'){
                this.model.set({default_value: result[0]});
            }
            else{
                this.model.set({default_value: result});
            }
        }
        else if (this.model.has('default_value')){
            this.model.unset('default_value');
        }
    },


    on_change_ignore_values: function(evt) {
        var value = this.$el.find('[name="ignore_values"]').val();
        var result = []
        _(this.facet_options).each(function(opt){
            opt['ignore'] = false;
            if (_(value).contains(opt.value)){
                opt['ignore'] = true;
                result.push(opt.value);
            }
        })
        if (result.length > 0){
            this.model.set({ignore_values: result});
        }
        else if (this.model.has('ignore_values')){
            this.model.unset('ignore_values');
        }
    },

    on_change_type: function(evt) {
        this.model.set({
            type: this.$el.find('[name="type"]').val()
        });
        this.check_constraints();
    },

    on_click_sort: function(evt) {
        evt.preventDefault();
        var direction = $(evt.target).data('sort-direction');
        var idx = this.model.collection.indexOf(this.model);
        var new_idx = idx + (direction == 'down' ? +1 : -1);
        if(new_idx < 0) { new_idx = 0; }
        this.model.collection.move(this.model, new_idx);
    },

    on_change_wildcard: function(evt) {
        if($(evt.target).is(':checked')) {
            this.model.set('include_wildcard', true);
        }
        else {
            this.model.unset('include_wildcard');
        }
        this.check_constraints();
    },

    on_change_multidim: function(evt) {
        if($(evt.target).is(':checked')) {
            this.model.set('multidim', true);
        }
        else {
            this.model.unset('multidim');
        }
    },

    check_constraints: function() {
        if(this.model.get('type') != 'select') {
            this.model.unset('include_wildcard');
        }
    },

    on_change_sorting: function() {
        this.model.set({
            'sortBy': this.$el.find('[name="sort-by"]').val(),
            'sortOrder': this.$el.find('[name="sort-order"]').val()
        });
    }

});


App.FacetCollection = Backbone.Collection.extend({

    constructor: function(value, dimensions) {
        Backbone.Collection.apply(this, [value]);

        var facets_to_keep = {};
        var add_model = _.bind(function(name, defaults) {
            var facet_model = this.findWhere({name: name});
            if(! facet_model) {
                var facet_model = this.findWhere({name: 'x-' + name});
                if(facet_model) { // hey, it's a multidim facet
                    var label = facet_model.get('label') || defaults['label'];
                    if(label.substr(0, 4) == '(X) ') {
                        label = label.substr(4);
                    }
                    facet_model.set({
                        name: name,
                        multidim: true,
                        label: label
                    });
                }
                else {
                    facet_model = new Backbone.Model({'name': name});
                    facet_model.set(defaults);
                }
            }
            this.add(facet_model);
            facets_to_keep[facet_model.cid] = true;
        }, this);
        _(dimensions).forEach(function(dimension) {
            if(dimension['type_label'] != 'dimension' &&
               dimension['type_label'] != 'dimension group') {
                return;
            }
            var name = dimension['notation'];
            add_model(name, {
                'dimension': name,
                'label': dimension['label']
            });
        });
        var to_remove = [];
        this.forEach(function(facet) {
            if(! facets_to_keep[facet.cid]) {
                to_remove.push(facet);
            }
        });
        this.remove(to_remove);
    },

    get_value: function(chart_multidim) {
        var multidim_facets = {};
        var all_multidim = _.range(chart_multidim);
        var facets_by_axis = {'all': []};
        _(all_multidim).forEach(function(n) {
            var letter = 'xyz'[n];
            facets_by_axis[letter] = [];
        });
        var facets_above = [];
        this.forEach(function(facet_model) {
            var facet = facet_model.toJSON();
            var multidim = facet['multidim'];
            delete facet['multidim'];
            if(multidim) {
                multidim_facets[facet['name']] = true;
                _(all_multidim).forEach(function(n) {
                    var letter = 'xyz'[n];
                    var prefix = letter + '-';
                    var constraints = {};
                    _(facets_above).forEach(function(name) {
                        constraints[name] = prefix + name;
                    });
                    var label = '(' + letter.toUpperCase() + ') '
                              + facet['label'];
                    facets_by_axis[letter].push(_({
                        name: prefix + facet['name'],
                        label: label,
                        constraints: constraints
                    }).defaults(facet));
                });
            }
            else {
                var constraints = {};
                _(facets_above).forEach(function(name) {
                    if(multidim_facets[name]) {
                        _(all_multidim).forEach(function(n) {
                            var letter = 'xyz'[n];
                            var prefix = letter + '-';
                            constraints[prefix + name] = prefix + name;
                        });
                    }
                    else {
                        constraints[name] = name;
                    }
                });
                facet['constraints'] = constraints;
                if(chart_multidim) {
                    facet['multidim_common'] = true;
                } else {
                    delete facet['multidim_common'];
                }
                facets_by_axis['all'].push(facet);
            }
            if(facet['type'] == 'select') {
                facets_above.push(facet['name']);
            }
        });
        var value = [];
        _(all_multidim).forEach(function(n) {
            var letter = 'xyz'[n];
            value = value.concat(facets_by_axis[letter]);
        });
        value = value.concat(facets_by_axis['all']);
        var value_facet = {
            name: 'value',
            type: 'all-values',
            dimension: 'value'
        };
        if(chart_multidim) {
            value_facet['multidim_value'] = true;
        }
        value.push(value_facet);
        return value;
    }

});


App.FacetsEditor = Backbone.View.extend({

    template: App.get_template('editor/facets.html'),

    title: "Facets",

    events: {
        'change [name="multiple_series"]': 'on_multiple_series_change',
        'change [name="highlights"]': 'on_highlights_change'
    },

    initialize: function(options) {
        this.categoryby = new App.CategoriesView({
            model: new Backbone.Model()
        });
        if(! this.model.has('multiple_series')) {
            this.model.set('multiple_series', null);
        }
        this.facet_views = _.object(this.model.facets.map(function(facet_model) {
            var facet_view = new App.FacetEditorField({
                model: facet_model,
                facets_editor: this
            });
            facet_view.on('options_received',
                          this.render_categories, this);
            return [facet_model.cid, facet_view];
        }, this)); this.apply_changes();
        this.render();
        this.model.facets.on('change sort', this.apply_changes, this);
    },

    render_categories: function(dimension, facet){
        var category_options = [];
        var category_facet = _(this.facet_views).find(function(view){
            return view.model.get('name') == this.model.get('category_facet');
        }, this);
        if (category_facet && category_facet.facet_options){
            _(category_facet.facet_options).each(function(cat){
                cat.highlight = false;
                if (_(this.model.get('highlights')).contains(cat.value)){
                    cat.highlight = true;
                }
                category_options.push(cat);
            }, this);
            this.categoryby.model.set('category_options', category_options);
        };
        this.categoryby.render();
    },

    compute_facet_roles: function() {
        var series_options = [];
        var no_multiple_series = true;
        var free_dimensions = [];
        this.model.facets.forEach(function(facet_model) {
            var facet = facet_model.toJSON();
            var name = facet['name'];
            if(facet['type'] == 'multiple_select' ||
               facet['type'] == 'all-values') {
                var option = _({}).extend(facet);
                if(name == this.model.get('multiple_series')) {
                    option['selected'] = true;
                    no_multiple_series = false;
                }
                else {
                    free_dimensions.push(option);
                }
                series_options.push(option);
            }
        }, this);
        if(no_multiple_series) {
            this.model.set('multiple_series', null);
        }
        var category_facet = (free_dimensions.length == 1
                             ? free_dimensions[0]
                             : null);
        if(category_facet) {
            this.model.set('category_facet', category_facet['name']);
        }
        this.categoryby.model.set({
            err_too_few: (free_dimensions.length < 1),
            err_too_many: (free_dimensions.length > 1),
            category_facet: category_facet
        });
        this.categoryby.render();
        this.facet_roles = {
            series_options: series_options,
            err_too_few: (free_dimensions.length < 1),
            err_too_many: (free_dimensions.length > 1),
            category_facet: category_facet
        }
    },

    render: function() {
        var context = {
            series_options: this.facet_roles.series_options,
            chart_is_multidim: this.chart_is_multidim()
        };
        this.$el.html(this.template(context));
        this.$el.find('.categories-by').html(this.categoryby.el);
        this.model.facets.forEach(function(facet_model) {
            var facet_view = this.facet_views[facet_model.cid];
            facet_view.render();
            this.$el.find('tbody').append(facet_view.el);
            facet_view.delegateEvents();
        }, this);
    },

    save_value: function() {
        var value = this.model.facets.get_value(this.model.get('multidim'));
        this.model.set('facets', value);
    },

    chart_is_multidim: function() {
        return this.model.get('multidim') ? true : false;
    },

    apply_changes: function() {
        this.compute_facet_roles();
        this.save_value();
    },

    on_highlights_change: function(){
        var select = this.$el.find('[name="highlights"]');
        this.model.set('highlights', select.val() || null);
        this.apply_changes();
    },

    on_multiple_series_change: function() {
        var select = this.$el.find('[name="multiple_series"]');
        this.model.set('multiple_series', select.val() || null);
        this.apply_changes();
    }

});

App.CategoriesView = Backbone.View.extend({
    template: App.get_template('editor/categories.html'),

    initialize: function(){
        this.render();
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        var params = {
            placeholder: "Select value",
            allowClear: true,
        }
        this.$el.find('[name="highlights"]').select2(params);
    }
});


})(App.jQuery);
