/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.Scenario2FiltersView = Backbone.View.extend({

    template: App.get_template('scoreboard/scenario2/filters.html'),

    events: {
        'change select': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        if(! this.model.get('indicator')) {
            var first_indicator = options['filters_data']['indicators'][0];
            this.model.set({
                'indicator': first_indicator['uri']
            });
        }
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        var value = this.model.toJSON();
        var data = JSON.parse(this.filters_data);
        var indicator_by_uri = _.object(_(data['indicators']).pluck('uri'),
                                        data['indicators']);
        var current_indicator = indicator_by_uri[value['indicator']];
        if(current_indicator) {
            current_indicator['selected'] = true;
        }

        _(data['countries']).forEach(function(country) {
            if(_(value['country']).contains(country['uri']))
                country['selected'] = true;
        });

        this.$el.html(this.template(data));

        this.$el.find('select[name=country]').select2();
    },

    update_filters: function() {
        this.model.set({
            'indicator': this.$el.find('select[name=indicator]').val(),
            'country': this.$el.find('select[name=country]').val()
        });
    }

});

App.scenario2_filters_schema = {
    filters: [
        {type: 'select',
         name: 'indicator',
         label: 'Select one indicator',
         dimension: 'indicator',
         constraints: { }
        },
        {type: 'select',
         name: 'country',
         label: 'Select the countries',
         dimension: 'breakdown',
         constraints: {
             'indicator': 'indicator'
         }},
    ]
};

App.scenario2_initialize = function() {

    var box = $('#scenario-box');
    box.html(App.get_template('scoreboard/scenario2/scenario2.html')());
    box.addClass('scenario2');

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    $.getJSON(App.URL + '/filters_data', function(data) {
        new App.Scenario2FiltersView({
            model: App.filters,
            el: $('#the-filters'),
            filters_data: data
        });

        App.scenario2_chart_view = new App.ScenarioChartView({
            model: App.filters,
            schema: App.scenario2_filters_schema,
            datasource: {
                data_preparation: {
                    group: {
                        filter_name: 'country',
                        labels: App.get_country_labels(data),
                    }
                },
                rel_url: '/data',
                extra_args: [
                    ['method', 'series_indicator_country'],
                    ['fields', 'ref-area,value'],
                    ['rev', App.DATA_REVISION]
                ]
            },
            scenario_chart: App.scenario2_chart
        });
        $('#the-chart').append(App.scenario2_chart_view.el);
        App.scenario2_chart_view.filters_changed();

        App.metadata = new App.IndicatorMetadataView({
            model: App.filters,
            field: 'indicator',
            indicators: App.get_indicators(data)
        });
        $('#the-metadata').append(App.metadata.el);

    });

    Backbone.history.start();

    if(! App.filters.get('country')) {
        var EU27 = ("http://data.lod2.eu/scoreboard/country/" +
                    "European+Union+-+27+countries");
        App.filters.set('country', [EU27]);
    }
};

})(App.jQuery);
