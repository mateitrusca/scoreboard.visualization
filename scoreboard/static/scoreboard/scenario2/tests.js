/*global App, Backbone, $, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('Scenario2FiltersView', function() {
    "use strict";

    var choose = App.testing.choose_option;

    beforeEach(function() {
        this.filters_data = {
            'indicators': [{'uri': 'ind1'}, {'uri': 'ind2'}],
            'countries': [{'uri': 'fr'}, {'uri': 'dk'}, {'uri': 'es'}]
        };
        this.model = new Backbone.Model();
        this.view = new App.Scenario2FiltersView({
            model: this.model,
            filters_data: this.filters_data
        });
    });

    describe('indicators selector', function() {

        it('should update model', function() {
            choose(this.view.$el.find('select[name=indicator]'), 'ind2');
            expect(this.model.get('indicator')).to.equal('ind2');
        });

        it('should select the current indicator', function() {
            this.model.set({'indicator': 'ind2'});
            choose(this.view.$el.find('select[name=indicator]'), 'ind2');
            var option_two = this.view.$el.find('select[name=indicator] ' +
                                                'option[value=ind2]');
            expect(option_two.attr('selected')).to.equal('selected');
        });

        it('should make an initial selection', function() {
            expect(this.model.get('indicator')).to.equal('ind1');
        });

    });

    describe('countries selector', function() {

        it('should update model', function() {
            choose(this.view.$el.find('select[name=country]'), 'dk');
            expect(this.model.get('country')).to.deep.equal(['dk']);
        });

        it('should update model with multiple values', function() {
            choose(this.view.$el.find('select[name=country]'), 'dk');
            choose(this.view.$el.find('select[name=country]'), 'es');
            this.view.$el.filter('select[name=country]').change();
            expect(this.model.get('country')).to.deep.equal(['dk', 'es']);
        });

        it('should select the current values', function() {
            this.model.set({'country': ['dk', 'es']});
            var sel = this.view.$el.find('select[name=country]');
            expect(sel.val()).to.deep.equal(['dk', 'es']);
        });

    });

});


describe('Scenario2ChartView', function() {
    "use strict";

    var server, scenario2_chart;

    beforeEach(function() {
        server = sinon.fakeServer.create();
        scenario2_chart = sinon.stub(App, 'scenario2_chart');

        this.model = new Backbone.Model();
        this.chart = new App.Scenario2ChartView({
            model: this.model,
            countries: [
                {'uri': 'http://data.lod2.eu/scoreboard/country/Denmark',
                 'label': "Denmark"},
                {'uri': 'http://data.lod2.eu/scoreboard/country/Spain',
                 'label': "Spain"}
            ]
        });
    });

    afterEach(function () {
        server.restore();
        scenario2_chart.restore();
    });

    it('should fetch data from server', function() {
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark']
        });

        var url = server.requests[1].url;
        expect(url).to.have.string(App.URL + '/data?');
        var url_param = App.testing.url_param;
        expect(url_param(url, 'method')).to.equal('get_one_indicator_country');
        expect(url_param(url, 'indicator')).to.equal('ind1');
        expect(url_param(url, 'country')).to.equal(
            'http://data.lod2.eu/scoreboard/country/Denmark');
    });

    it('should fetch metadata from server', function() {
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark']
        });

        var url2 = server.requests[0].url;
        expect(url2).to.have.string(App.URL + '/data?');
        var url_param = App.testing.url_param;
        expect(url_param(url2, 'method')).to.equal('get_indicator_meta');
        expect(url_param(url2, 'indicator')).to.equal('ind1');
    });

    it('should render chart with the data and metadata received', function() {
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark']
        });

        var ajax_metadata = [{
            'label': "The Label!",
            'comment': "The Definition!",
            'publisher': "The Source!"
        }];
        var data_dk = [{'year': "2010", 'value': 0.18},
                       {'year': "2011", 'value': 0.14}];

        server.requests[0].respond(200, {'Content-Type': 'application/json'},
                                   JSON.stringify(ajax_metadata));

        server.requests[1].respond(
            200, {'Content-Type': 'application/json'},
            JSON.stringify(data_dk));

        var container = this.chart.$el.find('.highcharts-chart')[0];
        expect(scenario2_chart.calledOnce).to.equal(true);
        var call_args = scenario2_chart.getCall(0).args;
        expect(call_args[0]).to.equal(container);
        expect(call_args[1]['series']).to.deep.equal([
            {'label': "Denmark", 'data': data_dk}
        ]);
        expect(call_args[1]['indicator_label']).to.equal(
            ajax_metadata[0]['label']);
    });

    it('should render chart with multiple countries', function() {
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark',
                        'http://data.lod2.eu/scoreboard/country/Spain']
        });

        var ajax_metadata = [{
            'label': "The Label!",
            'comment': "The Definition!",
            'publisher': "The Source!"
        }];
        var data_dk = [{'year': "2010", 'value': 0.18},
                       {'year': "2011", 'value': 0.14}];
        var data_es = [{'year': "2011", 'value': 0.22},
                       {'year': "2012", 'value': 0.26}];

        server.requests[0].respond(200, {'Content-Type': 'application/json'},
                                   JSON.stringify(ajax_metadata));

        server.requests[1].respond(
            200, {'Content-Type': 'application/json'},
            JSON.stringify(data_dk));

        server.requests[2].respond(
            200, {'Content-Type': 'application/json'},
            JSON.stringify(data_es));

        var call_args = scenario2_chart.getCall(0).args;
        expect(call_args[1]['series']).to.deep.equal([
            {'label': "Denmark", 'data': data_dk},
            {'label': "Spain", 'data': data_es}
        ]);
    });

});
