(function() {


App.IndicatorView = Backbone.View.extend({

    events: {
        'change select': 'update_filters'
    },

    'initialize': function(options) {
        this.indicators_data = options['indicators_data'];
        this.render();
    },

    'render': function() {
        this.$el.html(can.view('indicator_ejs',
                               new can.Observe(this.indicators_data)));
    },

    'update_filters': function() {
        this.model.set({
            'indicator': this.$el.find('select').val()
        });
    }

});


App.ChartView = Backbone.View.extend({

    'initialize': function() {
        this.model.on('change', this.render, this);
        this.render();
    },

    'render': function() {
        this.$el.html(can.view('chart_ejs', this.model.toJSON()));
    }

});


App.initialize = function() {
    App.filters = new Backbone.Model();

    new App.ChartView({
        model: App.filters,
        el: $('#the-chart')
    });

    $.getJSON(App.STATIC + '/indicators.json', function(data) {
        new App.IndicatorView({
            model: App.filters,
            el: $('#the-indicator'),
            indicators_data: data
        });
    });

};


$(document).ready(App.initialize);


})();
