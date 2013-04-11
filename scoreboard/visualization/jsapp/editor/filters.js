/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.FiltersEditor = Backbone.View.extend({

    template: App.get_template('editor/filters.html'),

    events: {
        'change [name="enable"]': 'on_click_enable'
    },

    title: "Filters",

    initialize: function(options) {
        this.filters = new Backbone.Collection();
        this.$el.html('loading...');
        var dimensions_ajax = $.get(options.cube_url + '/dimensions?flat=on');
        dimensions_ajax.done(_.bind(function(dimensions) {
            _(dimensions).forEach(function(dimension) {
                if(dimension['type_label'] == 'dimension' ||
                   dimension['type_label'] == 'group dimension') {
                    this.filters.add(new Backbone.Model({
                        'name': dimension['notation'],
                        'dimension': dimension['notation'],
                        'label': dimension['label'],
                        'enabled': true
                    }));
                }
            }, this);
            this.update();
            this.$el.html(this.template({
                'filters': this.filters.toJSON()
            }));
        }, this));
    },

    update: function() {
        var value = [];
        this.filters.forEach(function(filter) {
            if(! filter.get('enabled'))
                return;
            value.push(filter.toJSON());
        })
        this.model.set('filters', value);
    },

    on_click_enable: function(evt) {
        var checkbox = $(evt.target);
        var name = checkbox.val();
        var enabled = checkbox.is(':checked');
        this.filters.where({'name': name})[0].set('enabled', enabled);
        this.update();
    }

});


App.FiltersEditorReadOnly = App.FiltersEditor.extend({

    title: "Filters (disabled)",

    update: function() {
        // do nothing
    }

});


})(App.jQuery);
