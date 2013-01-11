(function() {
"use strict";


App.IndicatorMetadataView = Backbone.View.extend({

    template: App.get_template('scoreboard/metadata.html'),

    initialize: function(options) {
        this.field = options['field'];
        this.model.on('change:' + this.field, this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html("loading ...");
        var indicator = this.model.get(this.field);
        var $el = this.$el;
        var template = this.template;
        if(indicator) {
            var args = {
                'method': 'get_indicator_meta',
                'indicator': indicator
            };
            $.get(App.URL + '/data', args, function(data) {
                $el.html(template(data[0]));
            });
        }
    }

});


App.ChartRouter = Backbone.Router.extend({

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


})();
