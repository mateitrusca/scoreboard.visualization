/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */

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
            footer_meta_sources:
              { 'description': {
                  source: '/test_view',
                  filters: [
                    { target: 'part1',
                      name: 'indicator',
                      part: 'label' },
                    { target: 'part2',
                      name: 'unit-measure',
                      part: 'label' }
                  ]
                }
              }
        });

        var data_indicator = {
          "definition": "definition",
          "label": "label",
          "note": "note",
          "short_label": "short_label"
        }
        expect(server.requests[0].url).to.equal(
                '/test_view?dimension=indicator&value=ind1&rev='
        );
        App.respond_json(server.requests[0], data_indicator);

        var data_unit = {
          "definition": "definition",
          "label": "label",
          "note": "note",
          "short_label": "short_label"
        }
        App.respond_json(server.requests[1], data_unit);
        /*
        var data = {
            description:{
                'part1': data_indicator['label']
            }
        }
        var template = this.sandbox.spy(view, 'template');
        expect(template.calledOnce).to.equal(true);
        expect(template.calledWith(data)).to.equal(true);
        */
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
