(function() {

    var view = can.view('chart_ejs');
    $('#the-chart').empty().append(view);

    var Indicator = can.Control({
        'init': function(element, options) {
            $.getJSON(App.STATIC + '/indicators.json', function(data) {
                element.html(can.view('indicator_ejs', new can.Observe(data)));
            });
        }
    });
    var indicator_control = new Indicator('#the-indicator', {});

})();
