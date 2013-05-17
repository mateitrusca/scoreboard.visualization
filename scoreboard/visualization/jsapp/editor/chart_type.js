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
        {label: "Scatterplot", value: 'scatter', multidim: 2},
        {label: "Bubble chart", value: 'bubbles', multidim: 3},
        {label: "Map", value: 'map'}
    ],

    initialize: function(options) {
        this.render();
    },

    render: function() {
        var value = this.model.get('chart_type');
        var chart_types = _(this.chart_types).map(function(chart_type) {
            var selected = chart_type['value'] === value;
            return _({selected: selected}).extend(chart_type);
        }, this);
        var context = {
            chart_types: chart_types,
            animation: this.model.get('animation')
        };
        this.$el.html(this.template(context));
    },

    save: function() {
        var chart_type = this.$el.find('[name=chart-type]:checked').val();
        if(! _(this.chart_types).findWhere({value: chart_type})) {
            chart_type = this.chart_types[0]['value'];
        }
        var animation = this.$el.find('[name="animation"]').is(':checked');

        this.model.set({
            chart_type: chart_type,
            animation: animation
        });

        var chart_def = _(this.chart_types).findWhere({value: chart_type});
        var multidim = chart_def['multidim'];
        if(multidim) {
            this.model.set('multidim', multidim);
        }
        else {
            this.model.unset('multidim');
        }
    }

});


})(App.jQuery);
