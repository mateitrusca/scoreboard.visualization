/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('Scenario1FiltersView', function() {
    "use strict";

    var $ = App.jQuery;

    beforeEach(function() {
        this.filters_data = {'indicators': [
            {'uri': 'ind1', 'years': ["2009", "2010"]},
            {'uri': 'ind2', 'years': ["2010", "2011"]}
        ]};
        this.model = new Backbone.Model();
        this.view = new App.Scenario1FiltersView({
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

        it('should set year=null if missing from new indicator', function() {
            App.testing.choose_option(this.view.$el.find('select'), 'ind2');
            expect(this.model.get('year')).to.equal(null);
        });

        it('should make an initial selection', function() {
            expect(this.model.get('indicator')).to.equal('ind1');
        });

    });

    describe('year radio buttons', function() {

        it('should update model', function() {
            this.model.set({'indicator': 'ind1'});
            App.testing.choose_radio(this.view.$el.find('input[name=year]'),
                                     '2010');
            expect(this.model.get('year')).to.equal('2010');
        });

        it('should select the current year', function() {
            this.model.set({'indicator': 'ind1', 'year': '2010'});
            var year_two = this.view.$el.find('input[name=year][value=2010]');
            expect(year_two.attr('checked')).to.equal('checked');
        });

        it('should update list of years when indicator changes', function() {
            this.model.set({'indicator': 'ind1', 'year': '2010'});
            this.model.set({'indicator': 'ind2'});

            var years = this.view.$el.find('input[name=year]').map(function() {
                return $(this).val();
            }).get();
            expect(years).to.deep.equal(['2010', '2011']);
        });

        it('should make an initial selection', function() {
            expect(this.model.get('year')).to.equal('2009');
        });

    });

});


describe('Scenario1ChartView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.scenario1_chart = this.sandbox.stub(App, 'scenario1_chart');

        this.model = new Backbone.Model();
        this.chart = new App.Scenario1ChartView({
            model: this.model,
            titles: {
                // normally x_title is normal label and
                // y_title is short_label
                // here are inteantionally inversely initialized
                'x_title': {filter_name: 'indicator', type: 'short_label'},
                'y_title': {filter_name: 'unit-measure', type: 'label'}
            },
            schema: {filters: [
                {name: 'indicator',
                 label: 'Select indicator',
                 dimension: 'dim1',
                },
                {name: 'unit-measure',
                 label: 'Select unit of measure',
                 dimension: 'dim2',
                }
            ]}
        });
        this.model.set({
            'indicator-group': 'qq',
            'indicator': 'asdf',
            'time-period': '2002',
            'breakdown-group': 'total',
            'breakdown': 'ind_total',
            'unit-measure': 'pc_ind'
        });
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should be initialized with titles dimensions', function(){
        expect(_(this.chart.titles).keys()).to.deep.equal(
            ['x_title', 'y_title']
        );
    });

    it('should build dimensions_mapping from received filters schema', function(){
        expect(this.chart.dimensions_mapping).to.deep.equal(
            _.object(['indicator', 'unit-measure'], ['dim1', 'dim2'])
        );
    });

    it('should request labels for the right dimension', function(){
        var server = this.sandbox.server;
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2],
            {'label': '2', 'short_label': 'y_title'});
        App.respond_json(server.requests[3],
            {'label': 'x_title', 'short_label': '3'});
        var url = server.requests[2].url;
        expect(url).to.have.string('dimension=dim2');
        var url = server.requests[3].url;
        expect(url).to.have.string('dimension=dim1');
    });

    it('should fetch titles according to init params', function(){
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[3],
            {'label': 'normal_label', 'short_label': 'short_label'});
        //see initialisation titles param
        expect(this.chart.meta_data.x_title).to.equal('short_label');
        expect(this.chart.meta_data.y_title).to.equal('normal_label');
    });

    it('should fetch data from server', function() {
        var server = this.sandbox.server;
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/datapoints?');
        var url_param = App.testing.url_param;
        expect(url_param(url, 'fields')).to.equal('ref-area,value');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'time-period')).to.equal('2002');
    });

    it('should render chart with the data received', function() {
        var server = this.sandbox.server;
        var ajax_data = [{'ref-area': "Austria", 'value': 0.18},
                         {'ref-area': "Belgium", 'value': 0.14}];

        this.chart.meta_data = {};
        App.respond_json(server.requests[0], {'datapoints': ajax_data});
        App.respond_json(server.requests[1],
            {'label': 'request 1', 'short_label': 'lbl 1'});
        App.respond_json(server.requests[2],
            {'label': 'request 2', 'short_label': 'lbl 2'});

        expect(this.scenario1_chart.calledOnce).to.equal(true);
        var call_args = this.scenario1_chart.getCall(0).args;
        expect(call_args[0]).to.equal(this.chart.el);
        expect(call_args[1]['series']).to.deep.equal(ajax_data);
        //expect(call_args[1]['indicator_label']).to.equal("The Label!");
    });

    it('should save the selected indicator as x_title', function() {
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2],
            {'label': '2', 'short_label': 'y_title'});
        App.respond_json(server.requests[3],
            {'label': 'x_title', 'short_label': '3'});
        App.respond_json(server.requests[4],
            {'label': '4', 'short_label': 'y_title'});
        App.respond_json(server.requests[5],
            {'label': 'x_title', 'short_label': '5'});
        expect(this.chart.meta_data.x_title).to.equal('5');
    });

    it('should save the selected unit-measure as y_title', function() {
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2], {'label': '2', 'short_label': 'y_title'});
        App.respond_json(server.requests[3], {'label': 'x_title', 'short_label': '3'});
        App.respond_json(server.requests[4], {'label': '4', 'short_label': 'y_title'});
        App.respond_json(server.requests[5], {'label': 'x_title', 'short_label': '5'});
        expect(this.chart.meta_data.y_title).to.equal('4');
    });

});
