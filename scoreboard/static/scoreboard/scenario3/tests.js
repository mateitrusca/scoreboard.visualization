/*global App, Backbone, $, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('Scenario3FiltersView', function() {
    "use strict";

    var choose = App.testing.choose_option;

    beforeEach(function() {
        this.filters_data = {'indicators': [
            {'uri': 'ind1', 'years': ["2009", "2010"]},
            {'uri': 'ind2', 'years': ["2010", "2011", "2012"]},
            {'uri': 'ind3', 'years': ["2011", "2012"]}
        ]};
        this.model = new Backbone.Model();
        this.view = new App.Scenario3FiltersView({
            model: this.model,
            filters_data: this.filters_data
        });
    });

    describe('indicators selector', function() {

        it('should select x axis', function() {
            choose(this.view.$el.find('select[name=indicator_x]'), 'ind2');
            expect(this.model.get('indicator_x')).to.equal('ind2');
        });

        it('should select y axis', function() {
            choose(this.view.$el.find('select[name=indicator_y]'), 'ind2');
            expect(this.model.get('indicator_y')).to.equal('ind2');
        });

    });

    describe('year radio buttons', function() {

        var year_options = function(view) {
            return view.$el.find('[name=year]').map(function() {
                return $(this).attr('value');
            }).get();
        };

        it('should display 2010 for ind1/ind2', function() {
            this.model.set({'indicator_x': 'ind1', 'indicator_y': 'ind2'});
            expect(year_options(this.view)).to.deep.equal(['2010']);
        });

        it('should display 2011 and 2012 for ind2/ind3', function() {
            this.model.set({'indicator_x': 'ind2', 'indicator_y': 'ind3'});
            expect(year_options(this.view)).to.deep.equal(['2011', '2012']);
        });

        it('should display nothing for ind1/ind3', function() {
            this.model.set({'indicator_x': 'ind1', 'indicator_y': 'ind3'});
            expect(year_options(this.view)).to.deep.equal([]);
        });

        it('should select year', function() {
            this.model.set({'indicator_x': 'ind2', 'indicator_y': 'ind3'});
            App.testing.choose_radio(this.view.$el.find('input[name=year]'),
                                     '2011');
            expect(this.model.get('year')).to.equal('2011');
        });

        it('should deselect year if not available', function() {
            this.model.set({'indicator_x': 'ind2', 'indicator_y': 'ind3',
                            'year': '2011'});
            choose(this.view.$el.find('select[name=indicator_x]'), 'ind1');
            expect(this.model.get('year')).to.equal(null);
        });

    });

    it('should remember selection', function() {
        var value = {
            'indicator_x': 'ind2',
            'indicator_y': 'ind3',
            'year': '2011'
        };
        this.model.set(value);
        this.view.update_filters();
        expect(this.model.toJSON()).to.deep.equal(value);
    });

});


describe('Scenario3ChartView', function() {
    "use strict";

    var url_param = App.testing.url_param;

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.scenario3_chart = this.sandbox.stub(App, 'scenario3_chart');
        this.model = new Backbone.Model();
        this.view = new App.Scenario3ChartView({
            model: this.model,
            indicator_labels: {'ind2': "IndyTwo", 'ind3': "IndyThree"}
        });
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should fetch and render data from server', function() {
        this.sandbox.useFakeServer();
        this.model.set({'indicator_x': 'ind2', 'indicator_y': 'ind3',
                        'year': '2011'});
        var series = [
            {'value_x': 3, 'value_y': 9, 'country_label': 'Denmark'},
            {'value_x': 5, 'value_y': 6, 'country_label': 'Italy'}
        ];
        var data_request = this.sandbox.server.requests[0];
        var url = data_request.url;
        expect(url).to.have.string(App.URL + '/data?');
        expect(url_param(url, 'method')).to.equal('series_2indicator_year');
        expect(url_param(url, 'indicator_x')).to.equal('ind2');
        expect(url_param(url, 'indicator_y')).to.equal('ind3');
        expect(url_param(url, 'year')).to.equal(
            'http://data.lod2.eu/scoreboard/year/2011');
        App.respond_json(data_request, series);

        expect(this.scenario3_chart.calledOnce).to.equal(true);
        var call_args = this.scenario3_chart.getCall(0).args;
        expect(call_args[0]).to.equal(this.view.el);
        expect(call_args[1]['series']).to.deep.equal(series);
    });

});
