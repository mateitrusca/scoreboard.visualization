/*global App, Backbone, _ */
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
        //{label: "Scatterplot", value: 'scatter'},
        {label: "Map", value: 'map'}
    ],

    initialize: function(options) {
        var value = this.model.get('chart_type');
        var chart_types = _(this.chart_types).map(function(chart_type) {
            var selected = chart_type['value'] === value;
            return _({selected: selected}).extend(chart_type);
        }, this);
        this.$el.html(this.template({chart_types: chart_types}));
    },

    save: function() {
        var chart_type = this.$el.find('[name=chart-type]:checked').val();

        this.model.set({
            chart_type: chart_type
        });

        // XXX Handle this when evolution_columns is merged with columns
        if(chart_type === 'evolution_columns'){
            this.model.set({
                animation: true
            });
        }else{
            this.model.unset('animation');
        }
    }

});


})(App.jQuery);
