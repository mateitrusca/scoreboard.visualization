/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";

App.IndicatorFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    dimension: 'indicator',

    initialize: function(options) {
        var args = {'dimension': this.dimension};
        var ajax = $.get(App.URL + '/filter_options', args);
        var view = this;
        ajax.done(function(data) {
            view.dimension_options = data['options'];
            view.render();
        });
    },

    render: function() {
        this.$el.html(this.template({
            'dimension_options': this.dimension_options,
        }));
    }

});


App.YearFilter = Backbone.View.extend({

    template: App.get_template('scoreboard/filters/dropdown.html'),

    dimension: 'time-period',

    events: {
        'change select': 'on_selection_change'
    },

    initialize: function(options) {
        this.update();
        this.model.on('change:indicator', this.update, this);
    },

    update: function() {
        //console.log('updating year');
        // TODO abort any existing requests
        // TODO render greyed-out interface
        var args = {'dimension': this.dimension};
        var indicator = this.model.get('indicator');
        if(indicator) {
            args['indicator'] = indicator;
        }
        var view = this;
        var ajax = $.get(App.URL + '/filter_options', args);
        ajax.done(function(data) {
            view.dimension_options = data['options'];
            view.render();
            //console.log('year update done');
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


})(App.jQuery);
