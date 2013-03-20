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

describe('ScenarioChartViewParameters', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.model = new Backbone.Model();
        this.scenario_chart = this.sandbox.stub(App, 'scenario1_chart');
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should be initialized with meta labels', function(){
        var server = this.sandbox.server;
        var schema = {
            filters: [
                {type: 'select',
                 name: 'filter_name',
                 label: 'Select indicator group',
                 dimension: 'indicator-group',
                 constraints: {}}
            ]
        };
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/test_view',
                extra_args: [
                ]
            },
            meta_labels: [
                { targets: ['dyn_lbl'], filter_name: 'indicator', type: 'label' },
            ],
            schema: {filters: [ ]},
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(_(chart.meta_labels).pluck('targets')).to.deep.equal(
            [['dyn_lbl']]
        );
    });

    it('should build dimensions_mapping from received filters schema', function(){
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/test_view',
                extra_args: [
                ]
            },
            meta_labels: [
            ],
            schema: {filters: [
                {name: 'indicator',
                 dimension: 'dim1'}
            ]},
            scenario_chart: this.scenario_chart
        });
        expect(chart.dimensions_mapping).to.deep.equal(
            _.object(
                ['indicator'],
                ['dim1'])
        );
    });

    it('should request labels for the right dimension', function(){
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/datapoints_view',
                extra_args: [
                ]
            },
            meta_labels: [
                {targets: ['x_title'], filter_name: 'filter1', type: 'short_label'}
            ],
            schema: {filters: [
                {name: 'filter1',
                 dimension: 'dim1'}
            ]},
            scenario_chart: this.scenario_chart
        });
        chart.model.set({'filter1': 'dim1'});
        App.respond_json(server.requests[0], {'datapoints': []});
        var url = server.requests[1].url;
        expect(url).to.have.string('dimension=dim1');
        expect(url).to.have.string('value=dim1');
    });



    it('should use the datasource init param', function(){
        var server = this.sandbox.server;
        var schema = {
            filters: [
                {type: 'select',
                 name: 'indicator-group',
                 label: 'Select indicator group',
                 dimension: 'indicator-group',
                 constraints: {}}
            ]
        };
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/test_view',
                args: {
                    fields: 'ref-area,value',
                    rev: App.DATA_REVISION
                }
            },
            meta_labels: [ ],
            schema: {filters: [ ]},
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(url).to.have.string('test_view');
    });

    it('should append extra_args to args', function(){
        var server = this.sandbox.server;
        var schema = {
            filters: [
                {type: 'select',
                 name: 'indicator-group',
                 label: 'Select indicator group',
                 dimension: 'indicator-group',
                 constraints: {}}
            ]
        };
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/test_view',
                extra_args: [
                    ['param1', 'value1'],
                    ['param2', 'value2']
                ]
            },
            meta_labels: [ ],
            schema: {filters: [ ]},
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(url).to.have.string('param1=value1');
    });

    it('should render the chart passed as parameter', function(){
        var server = this.sandbox.server;
        var scenario_chart = sinon.spy();
        var schema = {
            filters: [
                {type: 'select',
                 name: 'indicator-group',
                 label: 'Select indicator group',
                 dimension: 'indicator-group',
                 constraints: {}}
            ]
        };
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/test_view',
                extra_args: [
                    ['param1', 'value1'],
                    ['param2', 'value2']
                ]
            },
            meta_labels: [ ],
            schema: {filters: [ ]},
            scenario_chart: scenario_chart
        });
        App.respond_json(server.requests[0], {'datapoints': []});
        expect(scenario_chart.calledOnce).to.equal(true);
    });

    it('should fetch labels according to init params', function(){
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            datasource: {
                rel_url: '/test_view',
                extra_args: [
                ]
            },
            meta_labels: [
                {targets: ['label1'], filter_name: 'indicator', type: 'label'},
                {targets: ['label2', 'label3'], filter_name: 'indicator', type: 'short_label'}
            ],
            schema: {filters: [ ]},
            scenario_chart: this.scenario_chart
        });
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});
        expect(chart.meta_data.label1).to.equal('normal_label');
        expect(chart.meta_data.label2).to.equal('short_label');
        expect(chart.meta_data.label3).to.equal(chart.meta_data.label2);
    });

});


describe('ScenarioChartView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.scenario_chart = this.sandbox.stub(App, 'scenario1_chart');

        this.model = new Backbone.Model();
        this.chart = new App.ScenarioChartView({
            model: this.model,
            meta_labels: [
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

            ]},
            datasource: {
                rel_url: '/datapoints',
                extra_args: [
                    ['fields', 'ref-area,value'],
                    ['rev', App.DATA_REVISION]
                ]
            },
            scenario_chart: this.scenario_chart
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

    it('should update year text according to selection', function(){
        var server = this.sandbox.server;
        this.chart.meta_data = {};
        this.model.set({'time-period': '2003'});
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1],
            {'label': 'request 2', 'short_label': 'lbl 2'});
        App.respond_json(server.requests[2],
            {'label': 'Year 2003', 'short_label': 'lbl 2'});
        expect(this.scenario_chart.calledOnce).to.equal(true);
        expect(this.chart.meta_data['extra_label']).to.equal('Year 2003');
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
        App.respond_json(server.requests[1], {'datapoints': ajax_data});
        expect(this.scenario_chart.calledOnce).to.equal(true);
        var call_args = this.scenario_chart.getCall(0).args;
        expect(call_args[0]).to.equal(this.chart.el);
        expect(call_args[1]['series']).to.deep.equal(ajax_data);
    });


});
