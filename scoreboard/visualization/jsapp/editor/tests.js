/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('ChartTypeEditor', function() {
    "use strict";

    var testing = App.testing;

    it('should select chart type', function() {
        var model = new Backbone.Model();
        var editor = new App.ChartTypeEditor({model: model});
        testing.choose_radio(editor.$el.find('[name=chart-type]'), 'columns');
        expect(model.get('chart_type')).to.equal('columns');
    });

});


describe('FiltersEditor', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it('should prefill dimensions', function() {
        var model = new Backbone.Model();
        var view = new App.FiltersEditor({model: model});
        var dimensions = [
            {type_label: 'measure', notation: 'ignore me'},
            {type_label: 'attribute', notation: 'ignore me too'},
            {type_label: 'group dimension', notation: 'indicator-group'},
            {type_label: 'dimension', notation: 'indicator'},
            {type_label: 'group dimension', notation: 'breakdown-group'},
            {type_label: 'dimension', notation: 'breakdown'},
            {type_label: 'dimension', notation: 'unit-measure'},
            {type_label: 'dimension', notation: 'ref-area'},
            {type_label: 'dimension', notation: 'time-period'}
        ];
        App.respond_json(this.sandbox.server.requests[0], dimensions);
        var filters = model.get('filters');
        expect(filters[0]['dimension']).to.equal('indicator-group');
        expect(filters[1]['dimension']).to.equal('indicator');
        expect(filters[2]['dimension']).to.equal('breakdown-group');
        expect(filters[3]['dimension']).to.equal('breakdown');
        expect(filters[4]['dimension']).to.equal('unit-measure');
        expect(filters[5]['dimension']).to.equal('ref-area');
        expect(filters[6]['dimension']).to.equal('time-period');
    });

});
