/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.Scenario1FiltersView = Backbone.View.extend({

    template: App.get_template('scoreboard/scenario1/filters.html'),

    events: {
        'change select': 'update_filters',
        'change input[name=year]': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        if(! this.model.get('indicator')) {
            var first_indicator = options['filters_data']['indicators'][0];
            this.model.set({
                'indicator': first_indicator['uri'],
                'year': first_indicator['years'][0]
            });
        }
        this.model.on('change', this.render, this);
        this.render();
    },

    get_options: function(value) {
        var data = JSON.parse(this.filters_data);
        var index = App.index_by(data['indicators'], 'uri');
        var indicator = index[value['indicator']];

        if(indicator) {
            data['years'] = _(indicator['years']).map(function(year) {
                return {
                    'value': year,
                    'selected': (year == value['year'])
                };
            });
            indicator['selected'] = true;
        }

        return data;
    },

    render: function() {
        var options = this.get_options(this.model.toJSON());
        this.$el.html(this.template(options));
    },

    update_filters: function() {
        var new_value = {'indicator': this.$el.find('select').val()};
        var year = this.$el.find('input[name=year]:checked').val();
        var options = this.get_options(new_value);
        var available_years = _(_(options['years']).pluck('value'));
        if(! available_years.contains(year)) { year = null; }
        new_value['year'] = year;
        this.model.set(new_value);
    }

});


App.Scenario1ChartView = Backbone.View.extend({

    className: 'highcharts-chart',

    initialize: function(options) {
        this.model.on('change', this.filters_changed, this);
        this.filters_changed();
    },

    render: function() {
        if(this.data) {
            App.scenario1_chart(this.el, this.data);
        }
    },

    filters_changed: function() {
        var view = this;
        var args = this.model.toJSON();
        if(!(args['indicator'] &&
             args['time-period'] &&
             args['breakdown'] &&
             args['unit-measure'])) {
            console.log('not all');
            return;  // not all filters have values
        }
        args['columns'] = 'ref-area,value';
        var series_ajax = $.get(App.URL + '/datapoints', args);

        series_ajax.done(function(data) {
            view.data = {
                'series': data['datapoints'],
                'year_text': "Year 2011",
                'indicator_label': "teh indicator",
                'credits': {
                    'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                    'text': 'European Commission, Digital Agenda Scoreboard'
                },
                'tooltip_formatter': function() {
                    return '<b>'+ this.x +'</b><br>: ' +
                           Math.round(this.y*10)/10 + ' %_ind';
                }
            };
            view.render();
        });
    }

});


App.scenario1_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario1/scenario1.html')());

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    function add_filter(dimension, constraints) {
        new App.SelectFilter({
            model: App.filters,
            dimension: dimension,
            constraints: constraints
        }).$el.appendTo($('#new-filters'));
    }

    add_filter('indicator', []);
    add_filter('time-period', ['indicator']);
    add_filter('breakdown', ['time-period', 'indicator']);
    add_filter('unit-measure', ['breakdown', 'time-period', 'indicator']);

    App.scenario1_chart_view = new App.Scenario1ChartView({
        model: App.filters,
        indicator_labels: {}
    });
    $('#the-chart').append(App.scenario1_chart_view.el);

    Backbone.history.start();
};

})(App.jQuery);
