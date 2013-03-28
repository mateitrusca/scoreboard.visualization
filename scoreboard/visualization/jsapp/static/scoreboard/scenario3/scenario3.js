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


App.scenario3_filters_schema = {
    filters: [
        {type: 'select',
         name: 'x-indicator-group',
         label: "(X) indicator group",
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'x-indicator',
         label: "(X) indicator",
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'x-indicator-group'
         }},
        {type: 'select',
         name: 'x-breakdown-group',
         label: "(X) breakdown group",
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'x-indicator'
         }},
        {type: 'select',
         name: 'x-breakdown',
         label: "(X) breakdown",
         dimension: 'breakdown',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown-group': 'x-breakdown-group'
         }},
        {type: 'select',
         name: 'x-unit-measure',
         label: "(X) unit of measure",
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown':       'x-breakdown'
         }},

        {type: 'select',
         name: 'y-indicator-group',
         label: "(Y) indicator group",
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'y-indicator',
         label: "(Y) indicator",
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'y-indicator-group'
         }},
        {type: 'select',
         name: 'y-breakdown-group',
         label: "(Y) breakdown group",
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'y-indicator'
         }},
        {type: 'select',
         name: 'y-breakdown',
         label: "(Y) breakdown",
         dimension: 'breakdown',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown-group': 'y-breakdown-group'
         }},
        {type: 'select',
         name: 'y-unit-measure',
         label: "(Y) unit of measure",
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown':       'y-breakdown'
         }},

        {type: 'select',
         xy: true,
         name: 'time-period',
         label: "Year",
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
    box.html(App.get_template('scoreboard/scenario.html')());
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
        },
        meta_labels: [
            { targets: ['indicator_x_label'], filter_name: 'x-indicator', type: 'short_label' },
            { targets: ['indicator_y_label'], filter_name: 'y-indicator', type: 'short_label' },
            { targets: ['period_label'], filter_name: 'time-period', type: 'label' },
            { targets: ['x_unit_label'], filter_name: 'x-unit-measure', type: 'short_label' },
            { targets: ['y_unit_label'], filter_name: 'y-unit-measure', type: 'short_label' },
        ]
    });
    $('#the-chart').append(App.scenario3_chart_view.el);

    App.metadata = new App.IndicatorMetadataView({
        model: App.filters,
        field: 'indicator',
        schema: App.scenario3_filters_schema,
        footer_meta_sources:
          { 'x': {
              title: "Label x-axis",
              source: '/dimension_value_metadata',
              filters: [
                { target: 'indicator',
                  name: 'x-indicator',
                  part: 'label' },
                { target: 'breakdown',
                  name: 'x-breakdown',
                  part: 'label' }
              ]
            },
            'y': {
                title: "Label y-axis",
                source: '/dimension_value_metadata',
                filters: [
                  { target: 'indicator',
                    name: 'y-indicator',
                    part: 'label' },
                  { target: 'breakdown',
                    name: 'y-breakdown',
                    part: 'label' }
                ]
              }
            }
    });

    App.share = new App.ShareOptionsView();

    $('#the-metadata').append(App.metadata.el);
    $('#the-share').append(App.share.el);

    Backbone.history.start();

};


})(App.jQuery);
