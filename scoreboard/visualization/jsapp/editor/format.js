/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.LabelEditor = Backbone.View.extend({

    template: App.get_template('editor/label.html'),

    events: {
        'change [name="facet"]': 'on_change',
        'change [name="field"]': 'on_change'
    },

    initialize: function(options) {
        this.render();
        this.on_change();
    },

    render: function() {
        var facet_options = this.options['facets'].map(function(facet) {
            return _({
                selected: (facet.get('value') == this.model.get('facet'))
            }).extend(facet.toJSON());
        }, this);
        var field_options = [
            {value: 'label', label: 'Long labels'},
            {value: 'short_label', label: 'Short labels'}
        ];
        _(field_options).forEach(function(item) {
            if(item['value'] == this.model.get('field')) {
                item['selected'] = true;
            }
        }, this);
        var context = {
            title: this.options['title'],
            facet_options: facet_options,
            field_options: field_options
        };
        this.$el.html(this.template(context));
    },

    on_change: function(evt) {
        this.model.set({
            facet: this.$el.find('[name="facet"]').val(),
            field: this.$el.find('[name="field"]').val()
        });
    }

});


App.FormatEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-format form-inline',

    template: App.get_template('editor/format.html'),

    title: "Format",

    initialize: function(options) {
        this.facets = new Backbone.Collection(this.model.get('facets'));
        var update_title_facets = _.bind(function() {
            this.facets.reset(_(_(this.model.get('facets'))
                                .where({type: 'select'}))
                              .map(function(facet) {
                return {value: facet['name'], label: facet['label']};
            }));
        }, this);
        update_title_facets();
        this.model.on('change:facets', update_title_facets);

        this.title_label = new App.LabelEditor({
            title: "Title",
            facets: this.facets,
            model: new Backbone.Model(
                (this.model.get('labels') || {})['title'])
        });
        this.title_label.model.on('change', function() {
            var labels = _({}).extend(this.model.get('labels'));
            var title = this.title_label.model.toJSON();
            if(title['facet']) {
                labels['title'] = title;
            }
            else {
                delete labels['title'];
            }
            this.model.set('labels', labels);
        }, this);
        this.render();
    },

    render: function() {
        this.$el.html(this.template());
        this.title_label.render();
        this.$el.find('[data-marker="title-label"]').replaceWith(
            this.title_label.el);
        this.title_label.delegateEvents();
    }

});


})(App.jQuery);
