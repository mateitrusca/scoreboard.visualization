/*global App, $script */
/*jshint sub:true */

(function($) {
"use strict";


App.Scenario5MapView = Backbone.View.extend({

    initialize: function(options) {
        this.model.on('change', this.filters_changed, this);
        this.filters_changed();
    },

    render: function() {
        this.$el.empty();
        if(this.data) {
            App.scenario5_map(this.el, this.data);
        }
    },

    filters_changed: function() {
        var view = this;
        var args = this.model.toJSON();
        if(!(args['indicator'] && args['year'])) {
            return;
        }
        var series_ajax = $.get(App.URL + '/data', {
            'method': 'series_indicator_year',
            'indicator': args['indicator'],
            'year': 'http://data.lod2.eu/scoreboard/year/' + args['year']
        });

        series_ajax.done(function(data) {
            view.data = {'series': data};
            view.render();
        });
    }
});


App.scenario5_initialize = function() {
    var qtip_css = App.STATIC + '/lib/qtip-2.0.1/jquery.qtip.css';
    $('<link rel="stylesheet">').attr('href', qtip_css).appendTo($('head'));
    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario.html')());
    box.addClass('scenario5');

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    $.getJSON(App.URL + '/filters_data', function(data) {
        new App.Scenario1FiltersView({
            model: App.filters,
            el: $('#the-filters'),
            filters_data: data
        });

        App.scenario5_map_view = new App.Scenario5MapView({
            el: $('#the-map')[0],
            model: App.filters,
            indicator_labels: App.get_indicator_labels(data)
        });

        App.metadata = new App.IndicatorMetadataView({
            model: App.filters,
            field: 'indicator',
            indicators: App.get_indicators(data)
        });
        $('#the-metadata').append(App.metadata.el);

        App.navigation = new App.NavigationView({
            model: App.filters
        });

        $('#the-navigation').append(App.navigation.el);

    });

    Backbone.history.start();
};


})(App.jQuery);
