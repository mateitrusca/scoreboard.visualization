/*global App, Backbone, _, describe, beforeEach, afterEach, it, expect, sinon */
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

    var $ = App.jQuery;

    var NoAjaxFacetsEditor = App.FacetsEditor.extend({
        get_dimensions: function() {
            this.dimensions = this.options.dimensions || [];
            this.load_value();
        }
    });

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
        this.box = $('<div>').css('display', 'none').appendTo($('body'));
    });

    afterEach(function () {
        this.sandbox.restore();
        this.box.remove();
    });

    describe('facet list', function() {

        it('should load dimensions via ajax', function() {
            var model = new Backbone.Model();
            var view = new App.FacetsEditor({model: model});
            var dimensions = [
                {type_label: 'dimension', notation: 'ref-area'},
                {type_label: 'dimension', notation: 'time-period'}
            ];
            App.respond_json(this.sandbox.server.requests[0], dimensions);
            expect(view.dimensions).to.deep.equal(dimensions);
        });

        it('should prefill dimensions', function() {
            var model = new Backbone.Model();
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [
                    {type_label: 'measure', notation: 'ignore me'},
                    {type_label: 'attribute', notation: 'ignore me too'},
                    {type_label: 'group dimension', notation: 'indicator-group'},
                    {type_label: 'dimension', notation: 'indicator'},
                    {type_label: 'group dimension', notation: 'breakdown-group'},
                    {type_label: 'dimension', notation: 'breakdown'},
                    {type_label: 'dimension', notation: 'unit-measure'},
                    {type_label: 'dimension', notation: 'ref-area'},
                    {type_label: 'dimension', notation: 'time-period'}
                ]
            });

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
            var view = new NoAjaxFacetsEditor({
                model: model,
                el: this.box,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            expect(model.get('facets')[0]['name']).to.equal('time-period');
            expect(model.get('facets')[0]['dimension']).to.equal('time-period');
        });

        it('should save filter type', function() {
            var model = new Backbone.Model();
            var view = new NoAjaxFacetsEditor({
                model: model,
                el: this.box,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            view.$el.find('select[name="type"]').val('data-column').change();
            expect(model.get('facets')[0]['type']).to.equal('data-column');
        });

        it('should create missing facets when loading config', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'data-column'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                el: this.box,
                dimensions: [
                    {type_label: 'dimension', notation: 'indicator'},
                    {type_label: 'dimension', notation: 'time-period'}
                ]
            });
            expect(_(model.get('facets')).pluck('name')).to.deep.equal(
                ['time-period', 'indicator']);
        });

    });

    describe('facet type', function() {

        it('should select existing filter type', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'data-column'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                el: this.box,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var select = view.$el.find('select[name="type"]');
            expect(select.val()).to.equal('data-column');
        });

        it('should reload from model on demand', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'data-column'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                el: this.box,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var read_current_selection = function() {
                return view.$el.find('select[name="type"]').val();
            };
            expect(read_current_selection()).to.equal('data-column');
            model.set('facets', [{name: 'time-period', type: 'all-values'}]);
            view.load_value();
            expect(read_current_selection()).to.equal('all-values');
        });

    });

});


describe('AdvancedEditor', function() {
    "use strict";

    it('should display current value', function() {
        var data = {a: 'b', c: ['d', 'e'], f: {g: true}};
        var model = new Backbone.Model(data);
        var view = new App.AdvancedEditor({model: model});
        var textarea_data = JSON.parse(view.$el.find('textarea').val());
        expect(textarea_data).to.deep.equal(data);
    });

    it('should save value to model and trigger event', function() {
        var data = {a: 'b', c: ['d', 'e'], f: {g: true}};
        var model = new Backbone.Model({x: 'y'});
        var view = new App.AdvancedEditor({model: model});
        var events = 0;
        view.on('save', function() { events += 1; });
        view.$el.find('textarea').val(JSON.stringify(data));
        view.$el.find('button').click();
        expect(model.toJSON()).to.deep.equal(data);
        expect(events).to.equal(1);
    });

});
