describe('IndicatorMetadataView', function() {
    "use strict";

    var server;

    beforeEach(function() {
        server = sinon.fakeServer.create();
    });

    afterEach(function () {
        server.restore();
    });

    it('should display data from server', function() {
        var view = new App.IndicatorMetadataView({
            model: new Backbone.Model({'indicator': 'asdf', 'year': '2002'})
        });

        expect(server.requests.length).to.equal(1);
        var url = server.requests[0].url;
        var url_param = App.testing.url_param;
        expect(url_param(url, 'method')).to.equal('get_indicator_meta');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'year')).to.equal(
            'http://data.lod2.eu/scoreboard/year/2002');

        var ajax_data = [{
            'label': "The Label!",
            'comment': "The Definition!",
            'publisher': "The Source!"
        }];
        server.requests[0].respond(200, {'Content-Type': 'application/json'},
                                   JSON.stringify(ajax_data));

        expect(view.$el.find('h3').text()).to.equal("The Label!");
        expect(view.$el.find('li:first').text()).to.contain.string(
            "The Definition!");
        expect(view.$el.find('li:last').text()).to.contain.string(
            "The Source!");
    });

});
