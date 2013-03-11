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
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.loadstate.on('change', this.filters_changed, this);
        this.filters_changed();
    },

    render: function() {
        if(this.data) {
            App.scenario1_chart(this.el, this.data);
        }
    },

    filters_changed: function() {
        var incomplete = false;
        var args = this.model.toJSON();
        _(['indicator-group', 'indicator', 'time-period', 'breakdown-group',
           'breakdown', 'unit-measure']).forEach(function(field) {
            if(! args[field]) { incomplete = true; }
            if(this.loadstate.get(field)) { incomplete = true; }
        }, this);
        if(incomplete) {
            // not all filters have values
            this.$el.html('--');
            return;
        }
        args['columns'] = 'ref-area,value';
        this.$el.html('-- loading --');

        var series_ajax = $.get(App.URL + '/datapoints', args);
        series_ajax.done(_.bind(function(data) {
            this.data = {
                'series': data['datapoints'],
                'year_text': "Year 2011",
                'indicator_label': this.model.get('indicator'),
                'credits': {
                    'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                    'text': 'European Commission, Digital Agenda Scoreboard'
                },
                'tooltip_formatter': function() {
                    return '<b>'+ this.x +'</b><br>: ' +
                           Math.round(this.y*10)/10 + ' %_ind';
                }
            };
            this.render();
        }, this));
    }

});


App.scenario1_filters_schema = {
    filters: [
        {type: 'select',
         dimension: 'indicator-group',
         constraints: []},
        {type: 'select',
         dimension: 'indicator',
         constraints: ['indicator-group']},
        {type: 'select',
         dimension: 'time-period',
         constraints: ['indicator-group',
                       'indicator']},
        {type: 'select',
         dimension: 'breakdown-group',
         constraints: ['time-period',
                       'indicator-group',
                       'indicator']},
        {type: 'radio',
         dimension: 'breakdown',
         constraints: ['breakdown-group',
                       'time-period',
                       'indicator-group',
                       'indicator']},
        {type: 'radio',
         dimension: 'unit-measure',
         constraints: ['breakdown-group',
                       'breakdown',
                       'time-period',
                       'indicator-group',
                       'indicator']}
    ]
};


App.scenario1_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario1/scenario1.html')());

    App.filters = new Backbone.Model();
    App.filter_loadstate = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    App.filters_box = new App.FiltersBox({
        el: $('#new-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario1_filters_schema
    });

    App.scenario1_chart_view = new App.Scenario1ChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        indicator_labels: {}
    });
    $('#the-chart').append(App.scenario1_chart_view.el);

    Backbone.history.start();
};

})(App.jQuery);
