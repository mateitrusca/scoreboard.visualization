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
            dynamic_labels: [
                // normally x_title is normal label and
                // y_title is short_label
                // here are intentionally inversely initialized
                {targets: ['x_title'], filter_name: 'indicator', type: 'short_label'},
                {targets: ['y_title', 'tooltip'], filter_name: 'unit-measure', type: 'label'},
                {targets: ['extra_label'], filter_name: 'time-period', type: 'label'}
            ],
            schema: {filters: [
                {name: 'indicator',
                 label: 'Select indicator',
                 dimension: 'dim1',
                },
                {name: 'unit-measure',
                 label: 'Select unit of measure',
                 dimension: 'dim2',
                },
                {name: 'time-period',
                 label: 'Select period',
                 dimension: 'dim3',
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

    it('should be initialized with dynamic labels', function(){
        expect(_(this.chart.dynamic_labels).pluck('targets')).to.deep.equal(
            [['x_title'], ['y_title', 'tooltip'], ['extra_label']]
        );
    });

    it('should build dimensions_mapping from received filters schema', function(){
        expect(this.chart.dimensions_mapping).to.deep.equal(
            _.object(
                ['indicator', 'unit-measure', 'time-period'],
                ['dim1', 'dim2', 'dim3'])
        );
    });

    it('should request labels for the right dimension', function(){
        var server = this.sandbox.server;
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2], {'label': '2', 'short_label': 'y_title'});
        App.respond_json(server.requests[3],
            {'label': 'x_title', 'short_label': '3'});
        App.respond_json(server.requests[4],
            {'label': '4', 'short_label': 'extra_label'});
        var url = server.requests[2].url;
        expect(url).to.have.string('dimension=dim1');
        url = server.requests[3].url;
        expect(url).to.have.string('dimension=dim2');
        url = server.requests[4].url;
        expect(url).to.have.string('dimension=dim3');
    });

    it('should fetch labels according to init params', function(){
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[3],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[4],
            {'label': 'normal_label', 'short_label': 'short_label'});
        //see initialisation dynamic_labels
        expect(this.chart.meta_data.x_title).to.equal('short_label');
        expect(this.chart.meta_data.y_title).to.equal('normal_label');
        expect(this.chart.meta_data.extra_label).to.equal('normal_label');
        expect(this.chart.meta_data.y_title).to.equal(
               this.chart.meta_data.tooltip);
    });

    it('should update year text according to selection', function(){
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.model.set({'time-period': '2003'});
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1],
            {'label': 'request 1', 'short_label': 'lbl 1'});
        App.respond_json(server.requests[2],
            {'label': 'request 2', 'short_label': 'lbl 2'});
        App.respond_json(server.requests[3],
            {'label': 'request 3', 'short_label': 'lbl 1'});
        App.respond_json(server.requests[4],
            {'label': 'request 4', 'short_label': 'lbl 2'});
        expect(this.scenario1_chart.calledOnce).to.equal(true);
        expect(this.chart.meta_data['year_text']).to.equal('Year 2003');
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
        App.respond_json(server.requests[3],
            {'label': 'request 3', 'short_label': 'lbl 3'});
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
            {'label': 'x_title', 'short_label': '3'});
        App.respond_json(server.requests[3],
            {'label': '2', 'short_label': 'y_title'});
        App.respond_json(server.requests[4],
            {'label': '4', 'short_label': 'extra_label'});
        expect(this.chart.meta_data.x_title).to.equal('3');
    });

    it('should save the selected unit-measure as y_title', function() {
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.chart.filters_changed();
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1], {'datapoints': []});
        App.respond_json(server.requests[2], {'label': 'x_title', 'short_label': '2'});
        App.respond_json(server.requests[3], {'label': '3', 'short_label': 'y_title'});
        App.respond_json(server.requests[4], {'label': '4', 'short_label': 'extra_label'});
        expect(this.chart.meta_data.y_title).to.equal('3');
    });

});
