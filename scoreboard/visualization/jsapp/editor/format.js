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
        this.$el.attr('data-label', options['name']);
        this.render();
        this.on_change();
    },

    render: function() {
        var facet_options = this.options['facets'].map(function(facet) {
            return {
                value: facet.get('name'),
                label: facet.get('label'),
                selected: (facet.get('name') == this.model.get('facet'))
            };
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

    events: {
        'change [name="height"]': 'on_change_height',
        'change [name="credits-text"]': 'on_change_credits',
        'change [name="credits-link"]': 'on_change_credits'
    },

    initialize: function(options) {
        this.title_label = new App.LabelEditor({
            name: 'title',
            title: "Title",
            facets: this.model.facets,
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

        this.subtitle_label = new App.LabelEditor({
            name: 'subtitle',
            title: "Subtitle",
            facets: this.model.facets,
            model: new Backbone.Model(
                (this.model.get('labels') || {})['subtitle'])
        });
        this.subtitle_label.model.on('change', function() {
            var labels = _({}).extend(this.model.get('labels'));
            var subtitle = this.subtitle_label.model.toJSON();
            if(subtitle['facet']) {
                labels['subtitle'] = subtitle;
            }
            else {
                delete labels['subtitle'];
            }
            this.model.set('labels', labels);
        }, this);

        this.render();
    },

    render: function() {
        var context = {
            height: this.model.get('height') || '500',
            credits: _({
                text: "European Commission, Digital Agenda Scoreboard",
                link: "http://ec.europa.eu/digital-agenda/en/graphs/"
            }).extend(this.model.get('credits'))
        };
        this.$el.html(this.template(context));
        this.title_label.render();
        this.$el.find('[data-marker="title-label"]').replaceWith(
            this.title_label.el);
        this.title_label.delegateEvents();
        this.subtitle_label.render();
        this.$el.find('[data-marker="subtitle-label"]').replaceWith(
            this.subtitle_label.el);
        this.subtitle_label.delegateEvents();
    },

    on_change_height: function() {
        this.model.set('height', this.$el.find('[name="height"]').val());
    },

    on_change_credits: function() {
        this.model.set('credits', {
            text: this.$el.find('[name="credits-text"]').val(),
            link: this.$el.find('[name="credits-link"]').val()
        });
    }

});


})(App.jQuery);
