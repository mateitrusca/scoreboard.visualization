describe('Scenario2FiltersView', function() {
    "use strict";

    beforeEach(function() {
        this.filters_data = {'indicators': [{'uri': 'ind1'}, {'uri': 'ind2'}]};
        this.model = new Backbone.Model;
        this.view = new App.Scenario2FiltersView({
            model: this.model,
            filters_data: this.filters_data
        });
    });

    describe('indicators selector', function() {

        it('should update model', function() {
            App.testing.choose_option(this.view.$el.find('select'), 'ind2');
            expect(this.model.get('indicator')).to.equal('ind2');
        });

        it('should select the current indicator', function() {
            this.model.set({'indicator': 'ind2'});
            App.testing.choose_option(this.view.$el.find('select'), 'ind2');
            var option_two = this.view.$el.find('option[value=ind2]');
            expect(option_two.attr('selected')).to.equal('selected');
        });

        it('should make an initial selection', function() {
            expect(this.model.get('indicator')).to.equal('ind1');
        });

    });

});


describe('Scenario2ChartView', function() {
    "use strict";

    var server, scenario2_chart;

    beforeEach(function() {
        server = sinon.fakeServer.create();
        scenario2_chart = sinon.stub(App, 'scenario2_chart');

        this.model = new Backbone.Model({'indicator': 'ind1'});
        this.chart = new App.Scenario2ChartView({model: this.model});
    });

    afterEach(function () {
        server.restore();
        scenario2_chart.restore();
    });

    it('should fetch data from server', function() {
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/data?')
        var url_param = App.testing.url_param;
        expect(url_param(url, 'method')).to.equal('get_one_indicator_country');
        expect(url_param(url, 'indicator')).to.equal('ind1');
        expect(url_param(url, 'country')).to.equal(
            'http://data.lod2.eu/scoreboard/country/Denmark');
    });

    it('should render chart with the data', function() {
        var ajax_data = [{'year': "2010", 'value': 0.18},
                         {'year': "2011", 'value': 0.14}];
        server.requests[0].respond(
            200, {'Content-Type': 'application/json'},
            JSON.stringify(ajax_data));

        var container = this.chart.$el.find('.highcharts-chart')[0];
        expect(scenario2_chart.calledOnce).to.equal(true);
        var call_args = scenario2_chart.getCall(0).args;
        expect(call_args[0]).to.equal(container);
        expect(call_args[1]['data']).to.deep.equal(ajax_data);
    });

});
