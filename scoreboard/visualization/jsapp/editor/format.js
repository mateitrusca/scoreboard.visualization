/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FormatEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-format form-inline',

    template: App.get_template('editor/format.html'),

    title: "Format",

    events: {
        'change [name="title-facet"]': 'on_change',
        'change [name="title-field"]': 'on_change'
    },

    initialize: function(options) {
        this.render();
        this.on_change();
    },

    render: function() {
        var title_item = (this.model.get('labels') || {})['title'] || {};
        var title_facet_options = [];
        _(this.model.get('facets')).forEach(function(facet) {
            if(facet['type'] == 'select') {
                title_facet_options.push({
                    value: facet['name'],
                    label: facet['label'],
                    selected: (facet['name'] == title_item['facet'])
                });
            }
        });
        var title_field_options = [
            {value: 'label', label: 'Long labels'},
            {value: 'short_label', label: 'Short labels'}
        ];
        _(title_field_options).forEach(function(item) {
            if(item['value'] == title_item['field']) {
                item['selected'] = true;
            }
        });
        var context = {
            title: {
                facet_options: title_facet_options,
                field_options: title_field_options
            }
        };
        this.$el.html(this.template(context));
    },

    on_change: function(evt) {
        var facet = this.$el.find('[name="title-facet"]').val();
        var field = this.$el.find('[name="title-field"]').val();
        var labels = _({}).extend(this.model.get('labels'));
        if(facet) {
            labels['title'] = {facet: facet, field: field};
        }
        this.model.set('labels', labels);
    }

});


})(App.jQuery);
