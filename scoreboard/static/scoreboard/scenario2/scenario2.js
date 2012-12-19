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
            'indicator': this.$el.find('select').val()
        });
    }

});


App.scenario2_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.render('scoreboard/scenario2/scenario2.html'));

    App.filters = new Backbone.Model();

    $.getJSON(App.URL + '/get_filters_scenario2', function(data) {
        new App.Scenario2FiltersView({
            model: App.filters,
            el: $('#the-filters'),
            filters_data: data
        });

    });
};

})();
