(function() {
"use strict";


App.Scenario2FiltersView = Backbone.View.extend({

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

        this.$el.html(App.render('scoreboard/scenario2/filters.html', data));
    },

    update_filters: function() {
        this.model.set({
            'indicator': this.$el.find('select').val(),
            'country': this.$el.find('select[name=country]').val()
        });
    }

});


App.Scenario2ChartView = Backbone.View.extend({

    initialize: function() {
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html(App.render('scoreboard/scenario2/chart.html',
                                 this.model.toJSON()));
        var container = this.$el.find('.highcharts-chart')[0];

        var args = this.model.toJSON();
        args['country'] = 'http://data.lod2.eu/scoreboard/country/Denmark';
        if(! args['indicator']) {
            return;
        }
        var data_ajax = $.get(App.URL + '/data',
            _({'method': 'get_one_indicator_country'}).extend(args));
        var metadata_ajax = $.get(App.URL + '/data',
            _({'method': 'get_indicator_meta'}).extend(args));
        $.when(data_ajax, metadata_ajax).done(
            function(data_resp, metadata_resp) {
            var metadata = metadata_resp[0][0];
            var options = {
                'data': data_resp[0],
                'indicator_label': metadata['label'],
                'credits': {
                    'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                    'text': 'European Commission, Digital Agenda Scoreboard'
                }
            };
            App.scenario2_chart(container, options);
        });
    }

});


App.scenario2_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.render('scoreboard/scenario2/scenario2.html'));

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    new App.Scenario2ChartView({
        model: App.filters,
        el: $('#the-chart')
    });

    $.getJSON(App.URL + '/get_filters_scenario2', function(data) {
        new App.Scenario2FiltersView({
            model: App.filters,
            el: $('#the-filters'),
            filters_data: data
        });

    });

    Backbone.history.start();
};

})();
