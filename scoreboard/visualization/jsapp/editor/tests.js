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

    it('should preselect current value', function() {
        var model = new Backbone.Model({chart_type: 'columns'});
        var editor = new App.ChartTypeEditor({model: model});
        expect(editor.$el.find(':checked').val()).to.equal('columns');
    });

});


describe('FacetsEditor', function() {
    "use strict";

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.box = $('<div>').css('display', 'none').appendTo($('body'));
    });

    afterEach(function () {
        this.sandbox.restore();
        this.box.remove();
    });

    var dimensions_data = [
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

    it('should prefill dimensions', function() {
        var model = new Backbone.Model();
        var view = new App.FacetsEditor({model: model});
        App.respond_json(this.sandbox.server.requests[0], dimensions_data);
        var facets = model.get('facets');
        expect(facets[0]['dimension']).to.equal('indicator-group');
        expect(facets[1]['dimension']).to.equal('indicator');
        expect(facets[2]['dimension']).to.equal('breakdown-group');
        expect(facets[3]['dimension']).to.equal('breakdown');
        expect(facets[4]['dimension']).to.equal('unit-measure');
        expect(facets[5]['dimension']).to.equal('ref-area');
        expect(facets[6]['dimension']).to.equal('time-period');
    });

    it('should save filter name same as dimension', function() {
        var model = new Backbone.Model();
        var view = new App.FacetsEditor({model: model, el: this.box});
        App.respond_json(this.sandbox.server.requests[0], [
            {type_label: 'dimension', notation: 'time-period'}
        ]);
        expect(model.get('facets')[0]['name']).to.equal('time-period');
        expect(model.get('facets')[0]['dimension']).to.equal('time-period');
    });

    it('should save filter type', function() {
        var model = new Backbone.Model();
        var view = new App.FacetsEditor({model: model, el: this.box});
        App.respond_json(this.sandbox.server.requests[0], [
            {type_label: 'dimension', notation: 'time-period'}
        ]);
        view.$el.find('select[name="type"]').val('data-column').change();
        expect(model.get('facets')[0]['type']).to.equal('data-column');
    });

    it('should create missing facets when loading config', function() {
        var model = new Backbone.Model({
            facets: [{name: 'time-period', type: 'data-column'}]
        });
        var view = new App.FacetsEditor({model: model, el: this.box});
        App.respond_json(this.sandbox.server.requests[0], [
            {type_label: 'dimension', notation: 'indicator'},
            {type_label: 'dimension', notation: 'time-period'}
        ]);
        expect(_(model.get('facets')).pluck('name')).to.deep.equal(
            ['time-period', 'indicator']);
    });

    it('should select existing filter type', function() {
        var model = new Backbone.Model({
            facets: [{name: 'time-period', type: 'data-column'}]
        });
        var view = new App.FacetsEditor({model: model, el: this.box});
        App.respond_json(this.sandbox.server.requests[0], [
            {type_label: 'dimension', notation: 'time-period'}
        ]);
        var select = view.$el.find('select[name="type"]');
        expect(select.val()).to.equal('data-column');
    });

});
