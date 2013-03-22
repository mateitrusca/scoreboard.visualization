/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('Scenario2ChartView', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.scenario2_chart = this.sandbox.stub(App, 'scenario2_chart');

        this.model = new Backbone.Model();
        this.chart = new App.ScenarioChartView({
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
                     dimension: 'breakdown',
                     constraints: {
                         'indicator': 'indicator'
                     }},
                ]
            },
            datasource: {
                data_preparation: {
                    group: {
                        filter_name: 'country',
                        labels: {
                            'http://data.lod2.eu/scoreboard/country/Denmark': "Denmark",
                            'http://data.lod2.eu/scoreboard/country/Spain': "Spain"
                        }
                    }
                },
                rel_url: '/data',
                extra_args: [
                    ['method', 'series_indicator_country'],
                    ['fields', 'ref-area,value'],
                    ['rev', App.DATA_REVISION]
                ]
            },
            indicator_labels: {'ind1': "The Label!"},
            meta_labels: [
                { targets: ['label'], filter_name: 'indicator', type: 'label' },
            ],
            scenario_chart: this.scenario2_chart
        });
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should fetch data from server', function() {
        this.sandbox.useFakeServer();
        var server = this.sandbox.server;
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark']
        });
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/data?');
        var url_param = App.testing.url_param;
        expect(url_param(url, 'method')).to.equal('series_indicator_country');
        expect(url_param(url, 'indicator')).to.equal('ind1');
        expect(url_param(url, 'country')).to.equal(
            'http://data.lod2.eu/scoreboard/country/Denmark');
    });

    it('should render chart with the data received', function() {
        this.sandbox.useFakeServer();
        var server = this.sandbox.server;
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark']
        });

        var data_dk = [{'year': "2010", 'value': 0.18},
                       {'year': "2011", 'value': 0.14}];
        App.respond_json(server.requests[0], data_dk);
        App.respond_json(server.requests[1],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});

        var container = this.chart.el;
        expect(this.scenario2_chart.calledTwice).to.equal(true);
        var call_args = this.scenario2_chart.getCall(0).args;
        expect(call_args[0]).to.equal(container);
        expect(call_args[1]['series']).to.deep.equal([
            {'label': "Denmark", 'data': data_dk}
        ]);
    });

    it('should render chart with multiple countries', function() {
        this.sandbox.useFakeServer();
        var server = this.sandbox.server;
        this.model.set({
            'indicator': 'ind1',
            'country': ['http://data.lod2.eu/scoreboard/country/Denmark',
                        'http://data.lod2.eu/scoreboard/country/Spain']
        });

        var data_dk = [{'year': "2010", 'value': 0.18},
                       {'year': "2011", 'value': 0.14}];
        var data_es = [{'year': "2011", 'value': 0.22},
                       {'year': "2012", 'value': 0.26}];

        App.respond_json(server.requests[0], data_dk);
        App.respond_json(server.requests[1], data_es);
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});
        App.respond_json(server.requests[3],
            {'label': 'normal_label', 'short_label': 'short_label'});

        var call_args = this.scenario2_chart.getCall(0).args;
        expect(call_args[1]['series']).to.deep.equal([
            {'label': "Denmark", 'data': data_dk},
            {'label': "Spain", 'data': data_es}
        ]);
    });

});
