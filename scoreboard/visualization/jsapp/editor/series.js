/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.SeriesEditor = Backbone.View.extend({

    tagName: 'form',
    className: 'editor-series form-inline',

    template: App.get_template('editor/series.html'),

    title: "Series",

    initialize: function(options) {
        this.render();
    },

    render: function() {
        var tooltips = [];
        _(this.model.dimensions).forEach(function(dimension) {
            if(dimension['type_label'] == 'attribute') {
                tooltips.push({
                    label: dimension['label'],
                    value: dimension['notation']
                });
            }
        });
        var context = {
            tooltips: tooltips
        };
        this.$el.html(this.template(context));
    }

});


})(App.jQuery);
