/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.ChartTypeEditor = Backbone.View.extend({

    template: App.get_template('editor/chart_type.html'),

    events: {
        'change': 'save'
    },

    chart_types: [
        {label: "Bar", disabled: true},
        {label: "Line", value: 'lines'},
        {label: "Column", value: 'columns'},
        {label: "Scatterplot", value: 'scatter'},
        {label: "Map", value: 'map'},
        {label: "Country Profile", disabled: true}
    ],

    initialize: function(options) {
        this.$el.html(this.template({chart_types: this.chart_types}));
    },

    save: function() {
        this.model.set({
            chart_type: this.$el.find('[name=chart-type]:checked').val()
        });
    }

});


})(App.jQuery);
