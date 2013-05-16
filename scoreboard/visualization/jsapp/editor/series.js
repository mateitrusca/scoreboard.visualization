/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.SeriesEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-series form-inline',

    template: App.get_template('editor/series.html'),

    title: "Series",

    events: {
        'change [name="tooltip"]': 'on_tooltip_change',
        'change [name="legend-label"]': 'on_legend_label_change'
    },

    initialize: function(options) {
        this.tooltips_model = new Backbone.Model(this.model.get('tooltips'));
        this.tooltips_model.on('change', function() {
            this.model.set('tooltips', this.tooltips_model.toJSON());
        }, this);
        this.render();
    },

    render: function() {
        var tooltips = [];
        _(this.model.dimensions).forEach(function(dimension) {
            if(dimension['type_label'] == 'attribute') {
                tooltips.push({
                    label: dimension['label'],
                    value: dimension['notation'],
                    checked: this.tooltips_model.get(dimension['notation'])
                });
            }
        }, this);
        var context = {
            tooltips: tooltips
        };
        this.$el.html(this.template(context));
    },

    on_tooltip_change: function() {
        _(this.$el.find('[name="tooltip"]')).forEach(function(checkbox) {
            var tooltip = $(checkbox).val();
            if($(checkbox).is(':checked')) {
                this.tooltips_model.set(tooltip, true);
            }
            else {
                this.tooltips_model.unset(tooltip);
            }
        }, this);
    },

    on_legend_label_change: function() {
        var value = this.$el.find('[name="legend-label"]').val();
        this.model.set('series-legend-label', value);
    }

});


})(App.jQuery);
