/*global App, Backbone, $, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('Scenario5MapView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.scenario5_map = this.sandbox.stub(App, 'scenario5_map');

        this.model = new Backbone.Model();
        this.view = new App.Scenario5MapView({
            model: this.model
        });
        this.model.set({
            'indicator': 'asdf',
            'year': '2002'
        });
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should fetch data from server', function() {
        var server = this.sandbox.server;
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/data?');
        var url_param = App.testing.url_param;
        expect(url_param(url, 'method')).to.equal('series_indicator_year');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'year')).to.equal(
            'http://data.lod2.eu/scoreboard/year/2002');
    });

    it('should render map with the data received', function() {
        var server = this.sandbox.server;
        var ajax_data = [{'country_name': "Austria", 'value': 0.18},
                         {'country_name': "Belgium", 'value': 0.14}];
        App.respond_json(server.requests[0], ajax_data);

        expect(this.scenario5_map.calledOnce).to.equal(true);
        var call_args = this.scenario5_map.getCall(0).args;
        expect(call_args[0]).to.equal(this.view.el);
        expect(call_args[1]['series']).to.deep.equal(ajax_data);
    });

});
