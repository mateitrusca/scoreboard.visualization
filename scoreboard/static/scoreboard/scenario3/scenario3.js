(function() {
"use strict";


App.Scenario3FiltersView = Backbone.View.extend({

    events: {
        'change select': 'update_filters',
        'change input[name=year]': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        var value = this.model.toJSON();

        var index_by = function(list, prop) {
            return _.object(_(list).pluck(prop), list);
        };

        var data = {
            'indicators_for_x': JSON.parse(this.filters_data)['indicators'],
            'indicators_for_y': JSON.parse(this.filters_data)['indicators']
        }

        var index_x = index_by(data['indicators_for_x'], 'uri');
        var index_y = index_by(data['indicators_for_y'], 'uri');
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
            'indicator_y': this.$el.find('select[name=indicator_y]').val(),
            'year': this.$el.find('[name=year]:checked').val()
        });
    }

});


App.scenario3_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.render('scoreboard/scenario3/scenario3.html'));
    box.addClass('scenario3');
};


})();
