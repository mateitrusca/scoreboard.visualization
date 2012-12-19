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

    var server;

    beforeEach(function() {
        server = sinon.fakeServer.create();

        this.model = new Backbone.Model({'indicator': 'ind1'});
        this.chart = new App.Scenario2ChartView({model: this.model});
    });

    afterEach(function () {
        server.restore();
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

});
