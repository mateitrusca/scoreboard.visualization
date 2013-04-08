/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('TimeSnapshotsExtraction', function() {
    "use strict";

    beforeEach(function(){
        this.series = [
            {data: [],
             label:'2000'},
            {data: [{
                        "ref-area": "AT",
                        "ref-area-label": "Austria",
                        "value": 0.4808
                    }],
             label:'2001'},
        ];
        this.x_series = {'AT': 'Austria'}
    });

    it('should return an array of snapshots', function(){
        var result = App.get_snapshots(this.series, this.x_series);
        expect(result.length).to.equal(2);
    });

    it('should sort the output by label', function(){
        var result = App.get_snapshots(this.series, this.x_series);
        expect(_(result).pluck('label')).to.deep.equal(['2000', '2001']);
    });

});

describe('ScenarioChartViewParameters', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.model = new Backbone.Model();
        this.scenario_chart = new sinon.spy();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should be initialized with meta labels', function() {
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                filters: [],
                chart_datasource: {
                    rel_url: '/test_view',
                    extra_args: []
                },
                chart_meta_labels: [
                    {targets: ['dyn_lbl'],
                     filter_name: 'indicator',
                     type: 'label'},
                ]
            },
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(_(chart.meta_labels).pluck('targets')).to.deep.equal(
            [['dyn_lbl']]
        );
    });

    it('should build dimensions_mapping from received filters schema',
       function() {
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                filters: [{name: 'indicator', dimension: 'dim1'}],
                chart_datasource: {
                    rel_url: '/test_view',
                    extra_args: []
                },
                chart_meta_labels: []
            },
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
            schema: {
                filters: [{name: 'filter1', dimension: 'dim1'}],
                chart_datasource: {
                    rel_url: '/datapoints_view',
                    extra_args: [
                    ]
                },
                chart_meta_labels: [
                    {targets: ['x_title'],
                     filter_name: 'filter1',
                     type: 'short_label'}
                ]
            },
            scenario_chart: this.scenario_chart
        });
        chart.model.set({'filter1': 'dim1'});
        App.respond_json(server.requests[0], {'datapoints': []});
        var url = server.requests[1].url;
        expect(url).to.have.string('dimension=dim1');
        expect(url).to.have.string('value=dim1');
    });



    it('should use the datasource init param', function() {
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
            schema: {
                filters: [],
                chart_datasource: {
                    rel_url: '/test_view',
                    args: {
                        fields: 'ref-area,value'
                    }
                },
                chart_meta_labels: []
            },
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(url).to.have.string('test_view');
    });

    it('should append extra_args to args', function() {
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
            schema: {
                filters: [],
                chart_datasource: {
                    rel_url: '/test_view',
                    extra_args: [
                        ['param1', 'value1'],
                        ['param2', 'value2']
                    ]
                },
                chart_meta_labels: []
            },
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(url).to.have.string('param1=value1');
    });

    it('should render the chart passed as parameter', function() {
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
            schema: {
                filters: [],
                chart_datasource: {
                    rel_url: '/test_view',
                    extra_args: [
                        ['param1', 'value1'],
                        ['param2', 'value2']
                    ]
                },
                chart_meta_labels: []
            },
            scenario_chart: scenario_chart
        });
        App.respond_json(server.requests[0], {'datapoints': []});
        expect(scenario_chart.calledOnce).to.equal(true);
    });

    it('should fetch labels according to init params', function() {
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                filters: [],
                chart_datasource: {
                    rel_url: '/test_view',
                    extra_args: []
                },
                chart_meta_labels: [
                    {targets: ['label1'],
                     filter_name: 'indicator',
                     type: 'label'},
                    {targets: ['label2', 'label3'],
                     filter_name: 'indicator',
                     type: 'short_label'}
                ]
            },
            scenario_chart: this.scenario_chart
        });
        App.respond_json(server.requests[0], {'datapoints': []});
        App.respond_json(server.requests[1],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});
        expect(chart.data.meta_data.label1).to.equal('normal_label');
        expect(chart.data.meta_data.label2).to.equal('short_label');
        expect(chart.data.meta_data.label3).to.equal(chart.data.meta_data.label2);
    });


    it('should fetch data using init filters dimensions', function() {
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                filters: [
                    {type: 'select',
                     name: 'indicator',
                     label: 'Select one indicator',
                     dimension: 'indicator',
                     constraints: { }
                    },
                    {type: 'select',
                     name: 'country',
                     label: 'Select one indicator',
                     dimension: 'ref-area',
                     constraints: {
                         'indicator': 'indicator'
                     }},
                ],
                chart_datasource: {
                    groupby: 'country',
                    rel_url: '/source_view',
                    extra_args: [
                        ['fields', 'dimension1,value1']
                    ]
                },
                chart_meta_labels: [
                    {targets: ['label1'], filter_name: 'indicator', type: 'label'}
                ]
            },
            scenario_chart: this.scenario_chart
        });
        this.model.set({
            'indicator': 'ind1',
            'country': ['BE']
        });
        var url = server.requests[0].url;
        var url_param = App.testing.url_param;
        expect(url_param(url, 'indicator')).to.equal('ind1');
        expect(url_param(url, 'fields')).to.equal('dimension1,value1');
        expect(url_param(url, 'ref-area')).to.equal('BE');
    });

});


describe('ScenarioChartView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    function setup_scenario() {
        this.scenario_chart = this.sandbox.spy();

        this.model = new Backbone.Model();
        this.chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                filters: [
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
                ],
                chart_meta_labels: [
                    {targets: ['extra_label'],
                     filter_name: 'time-period',
                     type: 'label'}
                ],
                chart_datasource: {
                    rel_url: '/datapoints',
                    extra_args: [
                        ['fields', 'ref-area,value']
                    ]
                }
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
    }

    it('should update year text according to selection', function(){
        setup_scenario.apply(this);
        var server = this.sandbox.server;
        this.model.set({'time-period': '2003'});
        App.respond_json(server.requests[2], {'datapoints': []});
        App.respond_json(server.requests[3],
            {'label': 'Year 2003', 'short_label': 'lbl 2'});
        expect(this.scenario_chart.calledOnce).to.equal(true);
        expect(this.chart.data.meta_data['extra_label']).to.equal('Year 2003');
    });

    it('should fetch data from server', function() {
        setup_scenario.apply(this);
        var server = this.sandbox.server;
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/datapoints?');
        var url_param = App.testing.url_param;
        expect(url_param(url, 'fields')).to.equal('ref-area,value');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'time-period')).to.equal('2002');
    });

    it('should render chart with the data received', function() {
        setup_scenario.apply(this);
        var server = this.sandbox.server;
        var ajax_data = [{'ref-area': "Austria", 'value': 0.18},
                         {'ref-area': "Belgium", 'value': 0.14}];

        App.respond_json(server.requests[0], {'datapoints': ajax_data});
        App.respond_json(server.requests[1],
            {'label': 'request 2', 'short_label': 'lbl 2'});
        expect(this.scenario_chart.calledOnce).to.equal(true);
        var call_args = this.scenario_chart.getCall(0).args;
        expect(call_args[0]).to.equal(this.chart.el);
        expect(call_args[1]['series'][0]['data']).to.deep.equal(ajax_data);
    });

    it('should make a single data query and then filter in JS', function() {
        var scenario_chart = sinon.spy();
        var model = new Backbone.Model();
        var filters = [{name: 'filter1', dimension: 'dim1'},
                       {name: 'filter2', dimension: 'dim2'},
                       {name: 'filter3', dimension: 'dim3'}];
        var chart = new App.ScenarioChartView({
            model: model,
            schema: {
                filters: filters,
                chart_datasource: {
                    rel_url: '/datapoints',
                    client_filter: 'filter3'
                }
            },
            scenario_chart: scenario_chart
        });
        model.set({'filter1': 'f1v',
                   'filter2': 'f2v',
                   'filter3': ['f3a', 'f3c']});

        var server = this.sandbox.server;
        expect(server.requests.length).to.equal(1);
        expect(server.requests[0].url).to.have.string('/datapoints?');
        expect(server.requests[0].url).to.not.have.string('dim3');

        App.respond_json(server.requests[0], {datapoints: [
            {dim3: 'f3a', value: 13},
            {dim3: 'f3b', value: 22},
            {dim3: 'f3c', value: 10}
        ]});

        var series = scenario_chart.getCall(0).args[1]['series'];
        expect(series.length).to.equal(1);
        expect(series[0]['data'][0]['value']).to.equal(13);
        expect(series[0]['data'][1]['value']).to.equal(10);
        expect(series[0]['data'].length).to.equal(2);
    });

});


describe('NavigationView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.model = new Backbone.Model();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should highlight the selected scenario', function(){
        var view = new App.NavigationView({scenario_url: 'scenario2/url'});
        App.respond_json(this.sandbox.server.requests[0], [
            {"id": "scenario1", "url": "scenario1/url"},
            {"id": "scenario2", "url": "scenario2/url"}
        ]);
        expect(view.$el.find('#scenario2').attr('class')).to.equal('selected')
    });

});

describe('AnnotationsView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.model = new Backbone.Model();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should request meta data according to init params', function(){
        this.model.set({
            'indicator': 'ind1',
            'unit-measure': 'unit1'
        });
        var server = this.sandbox.server;
        var view = new App.AnnotationsView({
            cube_url: App.URL,
            data_revision: 'one',
            model: this.model,
            field: 'indicator',
            schema: {
                filters: [{name: 'indicator', dimension: 'dim1'}],
                annotations: {
                    'ind1': {
                        title: 'meta_title',
                        source: '/test_view',
                        filters: [{name: 'indicator', part: 'label'},
                                  {name: 'unit-measure', part: 'note'}]
                    }
                }
            }
        });

        var template = this.sandbox.spy(view, 'template');

        var data_indicator = {
          "definition": "definition",
          "label": "label_indicator",
          "note": "note",
          "short_label": "short_label"
        }
        expect(server.requests[0].url).to.equal(
                '/test_view?dimension=dim1&value=ind1&rev=one'
        );
        App.respond_json(server.requests[0], data_indicator);

        var data_unit = {
          "definition": "definition",
          "label": "label_unit",
          "note": "note",
          "short_label": "short_label"
        }
        App.respond_json(server.requests[1], data_unit);
        var data = {'blocks': [
            {
                'title': 'meta_title',
                'info': [
                    data_indicator['label'],
                    data_unit['note']
                ]
            }
        ]}
        expect(template.calledOnce).to.equal(true);
        expect(template.getCall(0).args[0]['blocks']).to.deep.equal(data['blocks']);
    });

    it('should render the template with the right metadata', function(){
        this.model.set({
            'indicator': 'ind1',
            'unit-measure': 'unit1'
        });
        var server = this.sandbox.server;
        var view = new App.AnnotationsView({
            cube_url: App.URL,
            model: this.model,
            schema: {
                filters: [{name: 'indicator', dimension: 'dim1'},
                          {name: 'abc', dimension: 'dim2'}],
                annotations: {
                    'x': {
                        title: 'Label of x-axis',
                        source: '/test_view',
                        filters: [{name: 'indicator', part: 'label'}]
                    },
                    'y': {
                        title: 'Label of y-axis',
                        source: '/test_view',
                        filters: [{name: 'indicator', part: 'label'}]
                    }
                }
            }
        });

        var template = this.sandbox.spy(view, 'template');

        var data_1 = {
          "title": "Label of x-axis",
          "definition": "definition",
          "label": "label_1",
          "note": "note",
          "short_label": "short_label"
        };

        var data_2 = {
          "title": "Label of y-axis",
          "definition": "definition",
          "label": "label_2",
          "note": "note",
          "short_label": "short_label"
        };

        App.respond_json(server.requests[0], data_1);
        App.respond_json(server.requests[1], data_2);

        var data = {'blocks': [
            {
                'title': data_1['title'],
                'info':[
                    data_1['label']
                ]
            },
            {
                'title': data_2['title'],
                'info':[
                    data_2['label']
                ]
            }
        ]};

        expect(template.calledOnce).to.equal(true);
        expect(template.getCall(0).args[0]['blocks']).to.deep.equal(data['blocks']);
    });

});
