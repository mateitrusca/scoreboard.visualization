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

    initialize: function(options) {
        this.filters_data = options['filters_data'];
        this.render();
    },

    render: function() {
        this.$el.html(App.render('filters', this.filters_data));
        var value = this.model.toJSON();
        this.$el.find('select').val(value['indicator']);
        this.$el.find('input[name=year]')
                .filter('[value=' + value['year'] + ']')
                .attr('checked', 'checked');
    },

    update_filters: function() {
        this.model.set({
            'indicator': this.$el.find('select').val(),
            'year': this.$el.find('input[name=year]:checked').val()
        });
    }

});


App.make_filter_args = function(model) {
    var fix_indicator = function(value) {
        // TODO this is a hack. we should pass around the correct
        // indicator ID instead of recomputing it on the fly like this.
        return value.replace(/ /g, '_').replace(/%/g, '');
    };
    var args = model.toJSON();
    if(!(args['indicator'] && args['year'])) {
        return null;
    }
    return {
        'indicator': 'http://data.lod2.eu/scoreboard/indicators/' +
                     fix_indicator(args['indicator']),
        'year': 'http://data.lod2.eu/scoreboard/year/' + args['year']
    };
};


App.ChartView = Backbone.View.extend({

    initialize: function() {
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html(App.render('chart', this.model.toJSON()));
        var container = this.$el.find('.highcharts-chart')[0];
        var args = App.make_filter_args(this.model);
        if(args) {
            _(args).extend({'method': 'get_one_indicator_year'});
            $.get(App.URL + '/data', args, function(data) {
                App.render_highcharts(container, data);
            });
        }
    }

});


App.MetadataView = Backbone.View.extend({

    initialize: function() {
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html("loading ...");
        var args = App.make_filter_args(this.model);
        var $el = this.$el;
        if(args) {
            _(args).extend({'method': 'get_indicator_meta'});
            $.get(App.URL + '/data', args, function(data) {
                $el.html(App.render('metadata', data[0]));
            });
        }
    }

});


App.Router = Backbone.Router.extend({

    initialize: function(model) {
        this.model = model;
        this.route(/^chart\?(.*)$/, 'chart');
        var router = this;
        this.model.on('change', function(filters) {
            var state = encodeURIComponent(JSON.stringify(filters.toJSON()));
            router.navigate('chart?' + state);
        });
    },

    chart: function(state) {
        var value = JSON.parse(decodeURIComponent(state));
        this.model.set(value);
    }

});


App.initialize = function() {
    App.filters = new Backbone.Model();
    App.router = new App.Router(App.filters);

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

    new App.MetadataView({
        model: App.filters,
        el: $('#the-metadata')
    });

    Backbone.history.start();
};

})();
