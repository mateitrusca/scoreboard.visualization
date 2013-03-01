/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.SelectFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    events: {
        'change select': 'on_selection_change'
    },

    initialize: function(options) {
        this.dimension = options['dimension'];
        this.update();
    },

    inject_constraints: function(args) {
        /* noop */
    },

    update: function() {
        // TODO abort any existing requests
        // TODO render greyed-out interface
        var args = {'dimension': this.dimension};
        this.inject_constraints(args);
        var view = this;
        var ajax = $.get(App.URL + '/filter_options', args);
        ajax.done(function(data) {
            view.dimension_options = data['options'];
            view.render();
        });
    },

    render: function() {
        this.$el.html(this.template({
            'dimension_options': this.dimension_options,
        }));
    },

    on_selection_change: function() {
        var value = this.$el.find('select').val();
        var key = this.dimension;
        this.model.set(key, value);
    }

});


App.YearFilter = App.SelectFilter.extend({

    initialize: function(options) {
        options['dimension'] = 'time-period';
        App.SelectFilter.prototype.initialize.apply(this, arguments);
        // TODO handle constraints in SelectFilter
        this.model.on('change:indicator', this.update, this);
    },

    inject_constraints: function(args) {
        var indicator = this.model.get('indicator');
        if(indicator) {
            args['indicator'] = indicator;
        }
    }

});


})(App.jQuery);
