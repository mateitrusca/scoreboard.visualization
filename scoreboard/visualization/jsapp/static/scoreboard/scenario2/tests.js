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
                     name: 'countries',
                     label: 'Select one indicator',
                     dimension: 'ref-area',
                     constraints: {
                         'indicator': 'indicator'
                     }},
                ]
            },
            datasource: {
                groupby: 'countries',
                rel_url: '/source_view',
                extra_args: [
                    ['fields', 'dimension1,value1'],
                    ['rev', App.DATA_REVISION]
                ]
            },
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
            'countries': ['BE']
        });
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/source_view?');
        var url_param = App.testing.url_param;
        expect(url_param(url, 'indicator')).to.equal('ind1');
        expect(url_param(url, 'fields')).to.equal('dimension1,value1');
        expect(url_param(url, 'ref-area')).to.equal('BE');
    });

    it('should render chart with the data received', function() {
        this.sandbox.useFakeServer();
        var server = this.sandbox.server;
        this.model.set({
            'indicator': 'ind1',
            'countries': ['BE']
        });

        var data_be = {datapoints: [
                        {'year': "2010", 'value': 0.18},
                        {'year': "2011", 'value': 0.14}]
                      };
        var country_labels = {options: [{
                label: 'Belgium',
                notation: 'BE'
            }]
        }
        App.respond_json(server.requests[0], data_be);
        App.respond_json(server.requests[1], country_labels);
        App.respond_json(server.requests[2],
            {'label': 'normal_label', 'short_label': 'short_label'});
        var container = this.chart.el;
        expect(this.scenario2_chart.calledOnce).to.equal(true);
        var call_args = this.scenario2_chart.getCall(0).args;
        expect(call_args[0]).to.equal(container);
        expect(call_args[1]['series'][0]['data']).to.deep.equal(
            data_be['datapoints']
        );
        expect(call_args[1]['series'][0]['label']).to.equal("Belgium");
    });

    it('should render chart with multiple countries', function() {
        this.sandbox.useFakeServer();
        var server = this.sandbox.server;
        this.model.set({
            'indicator': 'ind1',
            'countries': ['DK', 'ES']
        });

        var data_dk = {datapoints: [{'year': "2010", 'value': 0.18},
                       {'year': "2011", 'value': 0.14}]};
        var data_es = {datapoints: [{'year': "2011", 'value': 0.22},
                       {'year': "2012", 'value': 0.26}]};
        var country_labels = {options: [
            { label: 'Denmark',
              notation: 'DK' },
            { label: 'Spain',
              notation: 'ES' },
        ]};

        App.respond_json(server.requests[0], data_dk);
        App.respond_json(server.requests[1], data_es);
        App.respond_json(server.requests[2], country_labels);
        App.respond_json(server.requests[3],
            {'label': 'normal_label', 'short_label': 'short_label'});
        var call_args = this.scenario2_chart.getCall(0).args;
        expect(call_args[1]['series']).to.deep.equal([
            {'label': "Denmark", 'data': data_dk['datapoints']},
            {'label': "Spain", 'data': data_es['datapoints']}
        ]);
    });

});
