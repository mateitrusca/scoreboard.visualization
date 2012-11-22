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


App.initialize = function() {
    var view = can.view('chart_ejs');
    $('#the-chart').empty().append(view);
    var indicator_control = new App.Indicator('#the-indicator', {});
};


$(document).ready(App.initialize);


})();
