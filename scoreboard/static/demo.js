(function() {
"use strict";

App.render = function(name, vars) {
    var template_id = name + '-template';
    var template_src = $('script#' + template_id).text();
    var template = Handlebars.compile(template_src);
    return template(vars);
};


App.FiltersView = Backbone.View.extend({

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
        var data = JSON.parse(this.filters_data);
        var indicator_by_uri = _.object(_(data['indicators']).pluck('uri'),
                                        data['indicators']);
        var current_indicator = indicator_by_uri[value['indicator']];
        if(current_indicator) {
            data['years'] = _(current_indicator['years']).map(function(year) {
                return {
                    'value': year,
                    'selected': (year == value['year'])
                }
            });
            current_indicator['selected'] = true;
        }

        this.$el.html(App.render('filters', data));
    },

    update_filters: function() {
        this.model.set({
            'indicator': this.$el.find('select').val(),
            'year': this.$el.find('input[name=year]:checked').val()
        });
    }

});


App.make_filter_args = function(model) {
    var args = model.toJSON();
    if(!(args['indicator'] && args['year'])) {
        return null;
    }
    return {
        'indicator': args['indicator'],
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

    $.getJSON(App.URL + '/get_filters', function(data) {
        var fix_indicator = function(value) {
            return 'http://data.lod2.eu/scoreboard/indicators/' +
                   value.replace(/ /g, '_').replace(/%/g, '');
        };
        _(data['indicators']).forEach(function(group) {
            _(group['options']).forEach(function(option) {
                option['value'] = fix_indicator(option['value']);
            });
        });
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
