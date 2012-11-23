(function() {


App.Indicator = can.Control({
    'init': function(element, options) {
        $.getJSON(App.STATIC + '/indicators.json', function(data) {
            element.html(can.view('indicator_ejs', new can.Observe(data)));
            var value = can.route.attr()['indicator'];
            element.find('select').val(value);
        });
    },
    'select change': function(element, evt) {
        var value = $(element).val();
        can.route.attr({indicator: value});
    }
});


App.Chart = can.Control({
    'route': function(data) {
        App.filters.set(data);
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
    var view = can.view('chart_ejs');
    $('#the-chart').empty().append(view);
    var indicator_control = new App.Indicator('#the-indicator', {});
    var chart_control = new App.Chart();
    new App.ChartView({
        model: App.filters,
        el: $('#the-chart')
    });
};


$(document).ready(App.initialize);


})();
