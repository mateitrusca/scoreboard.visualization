/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FiltersEditor = Backbone.View.extend({

    template: App.get_template('editor/filters.html'),

    initialize: function(options) {
        this.filters = new Backbone.Collection();
        this.$el.html('loading...');
        var dimensions_ajax = $.get(options.cube_url + '/dimensions?flat=on');
        dimensions_ajax.done(_.bind(function(dimensions) {
            _(dimensions).forEach(function(dimension) {
                if(dimension['type_label'] == 'dimension' ||
                   dimension['type_label'] == 'group dimension') {
                    this.filters.add(new Backbone.Model({
                        'dimension': dimension['notation']
                    }));
                }
            }, this);
            this.model.set('filters', this.filters.toJSON());
            this.$el.html(this.template());
        }, this));
    }

});


})(App.jQuery);
