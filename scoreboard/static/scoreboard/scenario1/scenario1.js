(function() {
"use strict";


App.Scenario1FiltersView = Backbone.View.extend({

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

    render: function() {
        var value = this.model.toJSON();
        var data = JSON.parse(this.filters_data);
        var index = App.index_by(data['indicators'], 'uri');
        var indicator = index[value['indicator']];

        if(indicator) {
            data['years'] = _(indicator['years']).map(function(year) {
                return {
                    'value': year,
                    'selected': (year == value['year'])
                }
            });
            indicator['selected'] = true;
        }

        this.$el.html(App.render('scoreboard/scenario1/filters.html', data));
    },

    update_filters: function() {
        var indicator = this.$el.find('select').val();
        var year = this.$el.find('input[name=year]:checked').val();

        var data = JSON.parse(this.filters_data);
        var indicator_by_uri = _.object(_(data['indicators']).pluck('uri'),
                                        data['indicators']);
        var current_indicator = indicator_by_uri[indicator];
        if(! _(current_indicator['years']).contains(year)) {
            year = null;
        }

        this.model.set({
            'indicator': indicator,
            'year': year
        });
    }

});


App.make_scenario1_filter_args = function(model) {
    var args = model.toJSON();
    if(!(args['indicator'] && args['year'])) {
        return null;
    }
    return {
        'indicator': args['indicator'],
        'year': 'http://data.lod2.eu/scoreboard/year/' + args['year']
    };
};


App.Scenario1ChartView = Backbone.View.extend({

    initialize: function() {
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html(App.render('scoreboard/scenario1/chart.html',
                                 this.model.toJSON()));
        var container = this.$el.find('.highcharts-chart')[0];
        var args = App.make_scenario1_filter_args(this.model);
        if(args) {
            var data_ajax = $.get(App.URL + '/data',
                _({'method': 'get_one_indicator_year'}).extend(args));
            var metadata_ajax = $.get(App.URL + '/data',
                _({'method': 'get_indicator_meta'}).extend(args));
            $.when(data_ajax, metadata_ajax).done(
                function(data_resp, metadata_resp) {
                var metadata = metadata_resp[0][0];
                var options = {
                    'data': data_resp[0],
                    'year_text': "Year 2011",
                    'indicator_label': metadata['label'],
                    'credits': {
                        'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
                        'text': 'European Commission, Digital Agenda Scoreboard'
                    },
                    'tooltip_formatter': function() {
                        return '<b>'+ this.x +'</b><br>: ' +
                               Math.round(this.y*10)/10 + ' %_ind';
                    }
                };
                App.scenario1_chart(container, options);
            });
        }
    }

});


App.scenario1_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.render('scoreboard/scenario1/scenario1.html'));

    App.filters = new Backbone.Model();
    App.router = new App.ChartRouter(App.filters);

    new App.Scenario1ChartView({
        model: App.filters,
        el: $('#the-chart')
    });

    $.getJSON(App.URL + '/get_filters_scenario1', function(data) {
        new App.Scenario1FiltersView({
            model: App.filters,
            el: $('#the-filters'),
            filters_data: data
        });

    });

    App.metadata = new App.IndicatorMetadataView({
        model: App.filters,
        field: 'indicator'
    });
    $('#the-metadata').append(App.metadata.el);

    Backbone.history.start();
};

})();
