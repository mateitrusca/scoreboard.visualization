/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.Scenario3FiltersView = Backbone.View.extend({

    template: App.get_template('scoreboard/scenario3/filters.html'),

    events: {
        'change select': 'update_filters',
        'change input[name=year]': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        this.model.on('change', this.render, this);
        this.render();
    },

    get_options: function(value) {
        var data = {
            'indicators_for_x': JSON.parse(this.filters_data)['indicators'],
            'indicators_for_y': JSON.parse(this.filters_data)['indicators']
        };

        var index_x = App.index_by(data['indicators_for_x'], 'uri');
        var index_y = App.index_by(data['indicators_for_y'], 'uri');
        var indicator_x = index_x[value['indicator_x']];
        var indicator_y = index_y[value['indicator_y']];
        if(indicator_x) { indicator_x['selected'] = true; }
        if(indicator_y) { indicator_y['selected'] = true; }

        if(indicator_x && indicator_y) {
            var years = _(indicator_x['years']).filter(function(y) {
                return _(indicator_y['years']).contains(y);
            });
            data['years'] = _(years).map(function(year) {
                return {
                    'value': year,
                    'selected': (year == value['year'])
                };
            });
        } else {
            data['years'] = [];
        }
        return data;
    },

    render: function() {
        var options = this.get_options(this.model.toJSON());
        this.$el.html(this.template(options));
    },

    update_filters: function() {
        var year = this.$el.find('[name=year]:checked').val();
        var new_value = {
            'indicator_x': this.$el.find('select[name=indicator_x]').val(),
            'indicator_y': this.$el.find('select[name=indicator_y]').val()
        };
        var options = this.get_options(new_value);
        var available_years = _(_(options['years']).pluck('value'));
        if(! available_years.contains(year)) { year = null; }
        new_value['year'] = year;
        this.model.set(new_value);
    }

});


App.Scenario3ChartView = Backbone.View.extend({

    className: "highcharts-chart",

    initialize: function(options) {
        this.model.on('change', this.filters_changed, this);
        this.loadstate = options['loadstate'] || new Backbone.Model();
        this.loadstate.on('change', this.filters_changed, this);
        this.filters_changed();
    },

    render: function() {
        if(this.data) {
            var options = {
                'series': this.data['series'],
                'indicator_x_label': this.data['indicator_x_label'],
                'indicator_y_label': this.data['indicator_y_label'],
                'credits': {
                    'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                    'text': 'European Commission, Digital Agenda Scoreboard'
                }
            };
            App.scenario3_chart(this.el, options);
        }
        else {
            this.$el.html("Please select some filters.");
        }
    },

    filters_changed: function() {
        var incomplete = false;
        var args = this.model.toJSON();
        var required = _(App.scenario3_filters_schema['filters']).pluck('name');
        _(required).forEach(function(field) {
            if(! args[field]) { incomplete = true; }
            if(this.loadstate.get(field)) { incomplete = true; }
        }, this);
        if(incomplete) {
            // not all filters have values
            this.$el.html('--');
            return;
        }
        args['columns'] = 'ref-area';
        args['xy_columns'] = 'value';
        args['rev'] = App.DATA_REVISION;
        this.$el.html('-- loading --');
        var series_ajax = $.get(App.URL + '/datapoints_xy', args);
        series_ajax.done(_.bind(function(data) {
            this.data = {
                'series': data['datapoints']
            };
            this.render();
        }, this));
    }

});


App.scenario3_filters_schema = {
    filters: [
        {type: 'select',
         name: 'x-indicator-group',
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'x-indicator',
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'x-indicator-group'
         }},
        {type: 'select',
         name: 'x-breakdown-group',
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'x-indicator'
         }},
        {type: 'radio',
         name: 'x-breakdown',
         dimension: 'breakdown',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown-group': 'x-breakdown-group'
         }},
        {type: 'radio',
         name: 'x-unit-measure',
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown':       'x-breakdown'
         }},

        {type: 'select',
         name: 'y-indicator-group',
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'y-indicator',
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'y-indicator-group'
         }},
        {type: 'select',
         name: 'y-breakdown-group',
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'y-indicator'
         }},
        {type: 'radio',
         name: 'y-breakdown',
         dimension: 'breakdown',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown-group': 'y-breakdown-group'
         }},
        {type: 'radio',
         name: 'y-unit-measure',
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown':       'y-breakdown'
         }},

        {type: 'select',
         xy: true,
         name: 'time-period',
         dimension: 'time-period',
         constraints: {
             'x-indicator':    'x-indicator',
             'x-breakdown':    'x-breakdown',
             'x-unit-measure': 'x-unit-measure',
             'y-indicator':    'y-indicator',
             'y-breakdown':    'y-breakdown',
             'y-unit-measure': 'y-unit-measure'
         }}
    ]
};


App.scenario3_initialize = function() {

    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario3/scenario3.html')());
    box.addClass('scenario3');

    App.filters = new Backbone.Model();
    App.filter_loadstate = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    App.filters_box = new App.FiltersBox({
        el: $('#the-filters')[0],
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario3_filters_schema
    });

    App.scenario3_chart_view = new App.ScenarioChartView({
        model: App.filters,
        loadstate: App.filter_loadstate,
        schema: App.scenario3_filters_schema,
        scenario_chart: App.scenario3_chart,
        datasource: {
            rel_url: '/datapoints_xy',
            extra_args: [
                ['columns', 'ref-area'],
                ['xy_columns', 'value'],
                ['rev', App.DATA_REVISION]
            ]
        }
    });
    $('#the-chart').append(App.scenario3_chart_view.el);

    Backbone.history.start();

};


})(App.jQuery);
