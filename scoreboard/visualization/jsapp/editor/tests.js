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


describe('FiltersEditor', function() {
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
        var view = new App.FiltersEditor({model: model});
        App.respond_json(this.sandbox.server.requests[0], dimensions_data);
        var filters = model.get('filters');
        expect(filters[0]['dimension']).to.equal('indicator-group');
        expect(filters[1]['dimension']).to.equal('indicator');
        expect(filters[2]['dimension']).to.equal('breakdown-group');
        expect(filters[3]['dimension']).to.equal('breakdown');
        expect(filters[4]['dimension']).to.equal('unit-measure');
        expect(filters[5]['dimension']).to.equal('ref-area');
        expect(filters[6]['dimension']).to.equal('time-period');
    });

    it('should remove filter if checkbox gets unchecked', function() {
        var model = new Backbone.Model();
        var view = new App.FiltersEditor({model: model, el: this.box});
        App.respond_json(this.sandbox.server.requests[0], dimensions_data);
        var get_filter_names = function() {
            return _(model.get('filters')).pluck('dimension');
        }
        var enable = view.$el.find('[name="enable"][value="ref-area"]');
        expect(get_filter_names()).to.include('ref-area');
        enable.click();
        expect(get_filter_names()).to.not.include('ref-area');
        enable.click();
        expect(get_filter_names()).to.include('ref-area');
    });

});
