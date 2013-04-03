/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */

describe('NavigationView', function() {
    "use strict";

    var NoAjaxNavigation = App.NavigationView.extend({

        fetch_scenarios: function(){
            var mock_ajax = App.jQuery.Deferred();
            mock_ajax.abort = function() {
                mock_ajax.reject();
            };
            return mock_ajax;
        }
    });

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.model = new Backbone.Model();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should update model when selection changes', function(){
        var model = new Backbone.Model();
        //model.set('scenario', 'scenario1');
        var router = new App.ChartRouter(model);
        var view = new NoAjaxNavigation({
            model: model,
            fetch_scenarios: function() {
                var mock_ajax = App.jQuery.Deferred();
                mock_ajax.abort = function() {
                    mock_ajax.reject();
                };
                return mock_ajax;
            }
        });
        var template = this.sandbox.spy(view, 'template');
        var response = [{
            "description": "",
            "image": "img/url",
            "portal_type": "ScoreboardVisualization",
            "title": "scenario1",
            "id": "scenario1",
            "url": "scenario1/url"
        },
        {
            "description": "",
            "image": "img/url",
            "portal_type": "ScoreboardVisualization",
            "title": "scenario2",
            "id": "scenario2",
            "url": "scenario2/url"
        }
        ];

        App.SCENARIO_URL = 'scenario2/url';
        view.ajax.resolve(response);
        App.testing.choose_scenario(view.$el.find('div'), 'scenario2')
        view.ajax.resolve(response);
        expect(model.get('scenario')).to.equal('scenario2');
        expect(view.$el.find('div').filter('#scenario2').attr('class')).to.equal(
            'selected')
        var rendering_data = template.getCall(0).args[0]['scenarios'];
        expect(rendering_data[1]['selected']).to.equal(true);
    });

});

describe('IndicatorMetaDataView', function() {
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
        var view = new App.IndicatorMetadataView({
            model: this.model,
            field: 'indicator',
            schema: {filters: [
                { name: 'indicator',
                 dimension: 'dim1'}
            ]},
            footer_meta_sources:
              { 'ind1': {
                  title: 'meta_title',
                  source: '/test_view',
                  filters: [
                    { name: 'indicator',
                      part: 'label' },
                    { name: 'unit-measure',
                      part: 'note' }
                  ]
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
                '/test_view?dimension=dim1&value=ind1&rev='
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
        var view = new App.IndicatorMetadataView({
            model: this.model,
            schema: {filters: [
                { name: 'indicator',
                 dimension: 'dim1'},
                { name: 'abc',
                 dimension: 'dim2'}
            ]},
            footer_meta_sources:
              { 'x': {
                  title: 'Label of x-axis',
                  source: '/test_view',
                  filters: [
                    { name: 'indicator',
                      part: 'label' },
                  ]
                },
                'y': {
                  title: 'Label of y-axis',
                  source: '/test_view',
                  filters: [
                    { name: 'indicator',
                      part: 'label' },
                  ]
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


describe('Float rounder', function() {
    "use strict";

    it('should round tiny values to 4 decimals', function() {
        expect(App.round(0.01234567, 3)).to.equal('0.0123');
        expect(App.round(0.02345678, 3)).to.equal('0.0235');
        expect(App.round(0.03456789, 3)).to.equal('0.0346');
        expect(App.round(0.04000000, 3)).to.equal('0.04');
    });

    it('should round small values to 2 decimals', function() {
        expect(App.round(1.234567, 3)).to.equal('1.23');
        expect(App.round(2.345678, 3)).to.equal('2.35');
        expect(App.round(3.456789, 3)).to.equal('3.46');
        expect(App.round(4.000000, 3)).to.equal('4');
    });

    it('should round large values to 0 decimals', function() {
        expect(App.round(123.4567, 3)).to.equal('123');
        expect(App.round(234.5678, 3)).to.equal('235');
        expect(App.round(345.6789, 3)).to.equal('346');
        expect(App.round(400.0000, 3)).to.equal('400');
    });

});


describe('ChartRouter encoding and decoding', function() {
    "use strict";

    function transmit(value) {
        var router = new App.ChartRouter(new Backbone.Model());
        return router.decode(router.encode(value));
    }

    it('should transmit an empty dict', function() {
        var value = {};
        expect(transmit(value)).to.deep.equal(value);
    });

    it('should transimt some string values', function() {
        var value = {a: 'b', c: 'd'};
        expect(transmit(value)).to.deep.equal(value);
    });

    it('should transmit lists', function() {
        var value = {a: [], b: ['1'], c: ['1', '2', '3']};
        expect(transmit(value)).to.deep.equal(value);
    });

    it('should transmit weird characters in the value', function() {
        var weird = '!@#$%^&*()-=<>,.:"?~`[]{}/|\\\'asdf';
        var value = {a: weird, b: [weird], c: [weird, weird]};
        expect(transmit(value)).to.deep.equal(value);
    });

    it('should return a blank object in case there is an error', function() {
        var router = new App.ChartRouter(new Backbone.Model());
        expect(router.decode('---')).to.deep.equal({});
    });

});