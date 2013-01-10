(function() {
"use strict";


App.Scenario3FiltersView = Backbone.View.extend({

    events: {
        'change select': 'update_filters'
    },

    initialize: function(options) {
        this.filters_data = JSON.stringify(options['filters_data']);
        this.render();
    },

    render: function() {
        var data = JSON.parse(this.filters_data);
        this.$el.html(App.render('scoreboard/scenario3/filters.html', data));
    },

    update_filters: function() {
        this.model.set({
            'indicator_x': this.$el.find('select[name=indicator_x]').val()
        });
    }

});


App.scenario3_initialize = function() {
    var box = $('#scenario-box');
    box.html(App.render('scoreboard/scenario3/scenario3.html'));
    box.addClass('scenario3');
};


})();
