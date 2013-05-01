/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.ChartTypeEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-charttype',
    template: App.get_template('editor/chart_type.html'),

    title: "Chart Type",

    events: {
        'change': 'save'
    },

    chart_types: [
        {label: "Line", value: 'lines'},
        {label: "Column", value: 'columns'},
        {label: "Column animation", value: 'evolution_columns'},
        {label: "Scatterplot", value: 'scatter'},
        {label: "Map", value: 'map'},
        {label: "Country Profile", value: 'country_profile'}
    ],

    initialize: function(options) {
        var value = this.model.get('chart_type');
        var chart_types = _(this.chart_types).map(function(chart_type) {
            var selected = chart_type['value'] == value;
            return _({selected: selected}).extend(chart_type);
        }, this);
        this.$el.html(this.template({chart_types: chart_types}));
    },

    save: function() {
        this.model.set({
            chart_type: this.$el.find('[name=chart-type]:checked').val()
        });
    }

});


})(App.jQuery);
