(function() {
"use strict";


App.IndicatorMetadataView = Backbone.View.extend({

    initialize: function() {
        this.model.on('change:indicator', this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html("loading ...");
        var indicator = this.model.get('indicator');
        var $el = this.$el;
        if(indicator) {
            var args = {
                'method': 'get_indicator_meta',
                'indicator': indicator
            };
            $.get(App.URL + '/data', args, function(data) {
                $el.html(App.render('scoreboard/metadata.html', data[0]));
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
