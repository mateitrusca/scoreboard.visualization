(function() {
"use strict";

App.render = function(name, vars) {
    var template_id = name + '-template';
    var template = $('script#' + template_id).text();
    return Mustache.render(template, vars);
};


App.FiltersView = Backbone.View.extend({

    events: {
        'change select': 'update_filters',
        'change input[name=year]': 'update_filters'
    },

    'initialize': function(options) {
        this.filters_data = options['filters_data'];
        this.render();
    },

    'render': function() {
        this.$el.html(App.render('filters', this.filters_data));
    },

    'update_filters': function() {
        this.model.set({
            'indicator': this.$el.find('select').val(),
            'year': this.$el.find('input[name=year]:checked').val()
        });
    }

});


App.ChartView = Backbone.View.extend({

    'initialize': function() {
        this.model.on('change', this.render, this);
        this.render();
    },

    'render': function() {
        this.$el.html(App.render('chart', this.model.toJSON()));
    }

});


App.initialize = function() {
    App.filters = new Backbone.Model();

    new App.ChartView({
        model: App.filters,
        el: $('#the-chart')
    });

    $.getJSON(App.STATIC + '/filters.json', function(data) {
        new App.FiltersView({
            model: App.filters,
            el: $('#the-filters'),
            filters_data: data
        });
    });

};

})();
