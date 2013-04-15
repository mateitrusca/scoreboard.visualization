/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('ChartSeriesPreparation', function() {
    "use strict";

    it('should return an array of snapshots', function(){
        var series = [
            {data: [],
             label:'2000'},
            {data: [{
                        "code": "AT",
                        "label": "Austria",
                        "value": 0.4808
                    }],
             label:'2001'},
        ];
        var result = App.format_series(series);
        expect(result.length).to.equal(2);
        expect(result[1]['data']).to.deep.equal([{
            'name': 'Austria',
            'code': 'AT',
            'y': 0.4808
        }]);
    });

    it('should sort the data in snapshots by label', function(){
        var series = [
            {data: [
                    {
                        "code": "BE",
                        "label": "Belgium",
                        "value": 0.3
                    },
                    {
                        "code": "BG",
                        "label": "Bulgaria",
                        "value": 0.4
                    },

                   ],
             label:'2000'},
            {data: [
                    {
                        "code": "BE",
                        "label": "Belgium",
                        "value": 0.4808
                    },
                    {
                        "code": "AT",
                        "label": "Austria",
                        "value": 0.4808
                    },

                   ],
             label:'2001'},
        ];
        var sort = _.object(["sort_by", "order"],['label', 1]);
        var result = App.format_series(series, sort);
        expect(result.length).to.equal(2);
        expect(result[0]['data'][0]['name']).equal('Austria');
    });

    it('should sort the snapshots by label', function(){
        var series = [
            {data: [],
             label:'2001'},
            {data: [{
                        "code": "AT",
                        "label": "Austria",
                        "value": 0.4808
                    }],
             label:'2000'},
        ];
        var result = App.format_series(series);
        expect(_(result).pluck('name')).to.deep.equal(['2000', '2001']);
        expect(result[0]['data']).to.deep.equal([{
            "name": "Austria",
            'code': 'AT',
            "y": 0.4808
        }]);
    });

    it('should return an array of data for each year', function(){
        var series = [
            {data: [],
             label:'2003'},
            {data: [{
                        "code": "AT",
                        "label": "Austria",
                        "value": 0.4808
                    }],
             label:'2001'},
        ];
        var result = App.format_series(series);
        expect(_(result).pluck('data')).to.deep.equal([
            [{ 'name': 'Austria',
               'code': 'AT',
               'y': 0.4808}],
            [{ 'name': 'Austria'}]
        ]);
    });

    it('should multiply the values with 100 when unit is %', function(){
        var series = [
            {data: [{
                        "code": "AT",
                        "label": "Austria",
                        "value": 0.4808
                    }],
             label:'2001'},
        ];
        var result = App.format_series(series, false, '', true);
        expect(result[0]['data'][0]['y']).to.deep.equal(48.08);
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
                facets: [],
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

    it('should build dimensions_mapping from received facets schema',
       function() {
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                facets: [{name: 'indicator', dimension: 'dim1'}],
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
                facets: [{name: 'filter1', dimension: 'dim1'}],
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

    it('should compute columns based on facets', function() {
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                facets: [
                    {type: 'data-column', dimension: 'dim1'},
                    {type: 'data-column', dimension: 'dim2'}
                ],
                chart_meta_labels: []
            },
            scenario_chart: this.scenario_chart
        });
        var url = server.requests[0].url;
        expect(App.testing.url_param(url, 'columns')).to.equal('dim1,dim2');
    });

    it('should render the chart passed as parameter', function() {
        var server = this.sandbox.server;
        var scenario_chart = sinon.spy();
        var schema = {
            facets: [
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
                facets: [],
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
                facets: [],
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


    it('should fetch data using init facet dimensions', function() {
        var server = this.sandbox.server;
        var chart = new App.ScenarioChartView({
            model: this.model,
            schema: {
                facets: [
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
                     multiple_series: true,
                     constraints: {
                         'indicator': 'indicator'
                     }},
                     {type: 'data-column', dimension: 'dimension1'},
                     {type: 'data-column', dimension: 'value1'}
                ],
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
        expect(url_param(url, 'columns')).to.equal('dimension1,value1');
        expect(url_param(url, 'ref-area')).to.equal('BE');
    });

    it('should fetch all series from an AllValuesFilter', function() {
        var loadstate = new Backbone.Model();
        var facets = [
            {type: 'all-values', multiple_series: true,
             dimension: 'ref-area', name: 'ref-area'},
            {type: 'data-column', dimension: 'value'}
        ];
        var filter = new App.AllValuesFilter(_({
            model: this.model,
            loadstate: loadstate
        }).extend(facets[0]));
        var chart = new App.ScenarioChartView({
            model: this.model,
            loadstate: loadstate,
            schema: {facets: facets},
            scenario_chart: this.scenario_chart
        });
        var country_options = [{'notation': 'area1'}, {'notation': 'area2'}];
        var url_param = App.testing.url_param;
        var requests = this.sandbox.server.requests;
        expect(requests[0].url).to.have.string('/dimension_values?');
        expect(url_param(requests[0].url, 'dimension')).to.equal('ref-area');
        App.respond_json(requests[0], {'options': country_options});
        expect(url_param(requests[1].url, 'ref-area')).to.equal('area1');
        expect(url_param(requests[1].url, 'columns')).to.equal('value');
        expect(url_param(requests[2].url, 'ref-area')).to.equal('area2');
        expect(url_param(requests[2].url, 'columns')).to.equal('value');
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
                facets: [
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
                    },
                    {type: 'data-column', dimension: 'ref-area'},
                    {type: 'data-column', dimension: 'value'}
                ],
                chart_meta_labels: [
                    {targets: ['extra_label'],
                     filter_name: 'time-period',
                     type: 'label'}
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
        expect(url_param(url, 'columns')).to.equal('ref-area,value');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'time-period')).to.equal('2002');
    });

    it('should render chart with the data received', function() {
        setup_scenario.apply(this);
        var server = this.sandbox.server;
        var ajax_data = [{'ref-area': 'AU','ref-area-label': "Austria", 'value': 0.18},
                         {'ref-area': 'BE','ref-area-label': "Belgium", 'value': 0.14}];

        App.respond_json(server.requests[0], {'datapoints': ajax_data});
        App.respond_json(server.requests[1],
            {'label': 'request 2', 'short_label': 'lbl 2'});
        expect(this.scenario_chart.calledOnce).to.equal(true);
        var call_args = this.scenario_chart.getCall(0).args;
        expect(call_args[0]).to.equal(this.chart.el);
        var expected_data = [{'code': 'AU', 'label': "Austria", 'value': 0.18},
                             {'code': 'BE', 'label': "Belgium", 'value': 0.14}];
        expect(call_args[1]['series'][0]['data']).to.deep.equal(expected_data);
    });

    it('should make a single data query and then filter in JS', function() {
        var scenario_chart = sinon.spy();
        var model = new Backbone.Model();
        var facets = [{name: 'filter1', dimension: 'dim1'},
                      {name: 'filter2', dimension: 'dim2'},
                      {name: 'filter3', dimension: 'dim3', on_client: true},
                      {type: 'data-column', dimension: 'dim4'}];
        var chart = new App.ScenarioChartView({
            model: model,
            schema: {facets: facets},
            scenario_chart: scenario_chart
        });
        model.set({'filter1': 'f1v',
                   'filter2': 'f2v',
                   'filter3': ['f3a', 'f3c']});

        var requests = this.sandbox.server.requests;
        var url0 = requests[0].url;
        expect(requests.length).to.equal(1);
        expect(url0).to.have.string('/datapoints?');
        expect(App.testing.url_param(url0, 'dim3')).to.equal(null);
        expect(App.testing.url_param(url0, 'columns')).to.equal('dim3,dim4');

        App.respond_json(requests[0], {datapoints: [
            {dim3: 'f3a', lbl: 'a', value: 13},
            {dim3: 'f3b', lbl: 'b', value: 22},
            {dim3: 'f3c', lbl: 'c', value: 10}
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
                facets: [{name: 'indicator', dimension: 'dim1', label:'Indicator'},
                         {name: 'unit-measure', dimension: 'dim2', label: 'Unit of measure'}],
                annotations: {
                    source: '/test_view',
                    filters: [{name: 'unit-measure', part: 'note'},
                              {name: 'indicator', part: 'label'} ]
                }
            }
        });

        var template = this.sandbox.spy(view, 'template');

        var data_unit = {
          "definition": "definition",
          "label": "label_unit",
          "note": "note",
          "short_label": "short_label"
        }
        App.respond_json(server.requests[0], data_unit);

        var data_indicator = {
            definition: "definition",
            note: "note",
            short_label: "short label",
            source_definition: "source definition",
            source_label: "source label",
            source_notes: "source notes",
            source_url: "http://source/url/"
        };
        App.respond_json(server.requests[1], data_indicator);

        _(data_indicator).extend({
            filter_name: "indicator",
            filter_label: "Indicator",
        });

        _(data_unit).extend({
            "filter_name": "unit-measure",
            "filter_label": "Unit of measure",
        });

        var data = {'blocks': [data_unit, data_indicator]}
        expect(template.calledOnce).to.equal(true);
        expect(template.getCall(0).args[0]['blocks']).to.deep.equal(data['blocks']);
    });

    it('should render the template with the right metadata', function(){
        this.model.set({
            'indicator': 'ind1',
            'abc': 'unit1'
        });
        var server = this.sandbox.server;
        var view = new App.AnnotationsView({
            cube_url: App.URL,
            model: this.model,
            schema: {
                facets: [{name: 'indicator', dimension: 'dim1', label:"label1"},
                         {name: 'abc', dimension: 'dim2', label:"label2"}],
                annotations: {
                        source: '/test_view',
                        filters: [{name: 'indicator', part: 'label'},
                                  {name: 'abc', part: 'label'}]
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

        _(data_1).extend({
          "filter_name": "indicator",
          "filter_label": "label1"
        })

        _(data_2).extend({
          "filter_name": "abc",
          "filter_label": "label2"
        })

        var data = {'blocks': [data_1, data_2]};

        expect(template.calledOnce).to.equal(true);
        expect(template.getCall(0).args[0]['blocks']).to.deep.equal(data['blocks']);
    });

});
