(function() {
"use strict";


App.Scenario3FiltersView = Backbone.View.extend({

    events: {
        'change select': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        var value = this.model.toJSON();
        var data = JSON.parse(this.filters_data);
        var indicator_by_uri = _.object(_(data['indicators']).pluck('uri'),
                                        data['indicators']);

        var indicator_x = indicator_by_uri[value['indicator_x']];
        var indicator_y = indicator_by_uri[value['indicator_y']];

        if(indicator_x && indicator_y) {
            var years = _(indicator_x['years']).filter(function(y) {
                return _(indicator_y['years']).contains(y);
            });
            data['years'] = _(years).map(function(year) {
                return {
                    'value': year
                }
            });
        } else {
            data['years'] = [];
        }

        this.$el.html(App.render('scoreboard/scenario3/filters.html', data));
    },

    update_filters: function() {
        this.model.set({
            'indicator_x': this.$el.find('select[name=indicator_x]').val(),
            'indicator_y': this.$el.find('select[name=indicator_y]').val()
        });
    }

});


App.scenario3_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.render('scoreboard/scenario3/scenario3.html'));
    box.addClass('scenario3');
};


})();
