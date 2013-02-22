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


App.Scenario2ChartView = Backbone.View.extend({

    className: "highcharts-chart",

    initialize: function(options) {
        this.country_labels = options['country_labels'];
        this.indicator_labels = options['indicator_labels'];
        this.model.on('change', this.filters_changed, this);
    },

    render: function() {
        if(this.data) {
            App.scenario2_chart(this.el, this.data);
        }
    },

    filters_changed: function() {
        var view = this;
        var args = this.model.toJSON();
        if(! (args['indicator'] && args['country'])) {
            return;
        }

        var countries = args['country'];
        var requests = _(countries).map(function(country_uri) {
            var data_ajax = $.get(App.URL + '/data', {
                'method': 'series_indicator_country',
                'indicator': args['indicator'],
                'country': country_uri
            });
            return data_ajax;
        });
        var country_labels = this.country_labels;

        var ajax_calls = $.when.apply($, requests);
        ajax_calls.done(function() {
            var responses = (requests.length == 1) ? _([arguments])
                                                   : _(arguments).toArray();
            var series = _(responses).map(function(resp, n) {
                return {
                    'label': country_labels[countries[n]],
                    'data': resp[0]
                };
            });
            view.data = {
                'series': series,
                'indicator_label': view.indicator_labels[args['indicator']],
                'credits': {
                    'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                    'text': 'European Commission, Digital Agenda Scoreboard'
                }
            };
            view.render();
        });
    }

});


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

        App.scenario2_chart_view = new App.Scenario2ChartView({
            model: App.filters,
            country_labels: App.get_country_labels(data),
            indicator_labels: App.get_indicator_labels(data)
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
