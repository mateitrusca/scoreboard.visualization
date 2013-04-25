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
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    describe('facet list', function() {

        it('should load dimensions via ajax', function() {
            this.sandbox.useFakeServer();
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
                    {type_label: 'dimension group', notation: 'indicator-group'},
                    {type_label: 'dimension', notation: 'indicator'},
                    {type_label: 'dimension group', notation: 'breakdown-group'},
                    {type_label: 'dimension', notation: 'breakdown'},
                    {type_label: 'dimension', notation: 'unit-measure'},
                    {type_label: 'dimension', notation: 'ref-area'},
                    {type_label: 'dimension', notation: 'time-period'}
                ]
            });

            expect(_(model.get('facets')).pluck('dimension')).to.deep.equal([
                'indicator-group', 'indicator', 'breakdown-group',
                'breakdown', 'unit-measure', 'ref-area', 'time-period',
            ]);
        });

        it('should save filter name same as dimension', function() {
            var model = new Backbone.Model();
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            expect(model.get('facets')[0]['name']).to.equal('time-period');
            expect(model.get('facets')[0]['dimension']).to.equal('time-period');
        });

        it('should save filter type', function() {
            var model = new Backbone.Model();
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            view.$el.find('select[name="type"]').val('multiple_select').change();
            expect(model.get('facets')[0]['type']).to.equal('multiple_select');
        });

        it('should create missing facets when loading config', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [
                    {type_label: 'dimension', notation: 'indicator'},
                    {type_label: 'dimension', notation: 'time-period'}
                ]
            });
            expect(_(model.get('facets')).pluck('name')).to.deep.equal(
                ['time-period', 'indicator']);
        });

        it('should remove facets with no corresponding dimension', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: []
            });
            expect(model.get('facets').length).to.equal(0);
        });

    });

    describe('facet type', function() {

        it('should select existing filter type', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var select = view.$el.find('select[name="type"]');
            expect(select.val()).to.equal('multiple_select');
        });

        it('should reload from model on demand', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var read_current_selection = function() {
                return view.$el.find('select[name="type"]').val();
            };
            expect(read_current_selection()).to.equal('multiple_select');
            model.set('facets', [{name: 'time-period', type: 'all-values'}]);
            view.load_value();
            expect(read_current_selection()).to.equal('all-values');
        });

    });

    describe('multiple series', function() {

        var four_dimensions = [{type_label: 'dimension', notation: 'dim1'},
                               {type_label: 'dimension', notation: 'dim2'},
                               {type_label: 'dimension', notation: 'dim3'},
                               {type_label: 'dimension', notation: 'dim4'}];

        it('should display list of series options', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model({
                    facets: [
                        {name: 'dim3', type: 'all-values'},
                        {name: 'dim4', type: 'all-values'}
                    ]
                }),
                dimensions: four_dimensions
            });
            var options = view.$el.find('[name="multiple_series"] option');
            var series_options = _(options).map(function(opt) {
                return $(opt).attr('value');
            });
            expect(series_options).to.deep.equal(['', 'dim3', 'dim4']);
        });

        it('should update model with selection', function() {
            var model = new Backbone.Model({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            expect(model.get('multiple_series')).to.be.null;
            view.$el.find('[name="multiple_series"]').val('dim3').change();
            expect(model.get('multiple_series')).to.equal('dim3');
        });

        it('should render multiple_series with selected value', function() {
            var model = new Backbone.Model({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            var select = view.$el.find('[name="multiple_series"]');
            expect(select.val()).to.equal('dim3');
        });

    });

    describe('facet verification', function() {

        var four_dimensions = [{type_label: 'dimension', notation: 'dim1'},
                               {type_label: 'dimension', notation: 'dim2'},
                               {type_label: 'dimension', notation: 'dim3'},
                               {type_label: 'dimension', notation: 'dim4'}];

        it('should warn if there is no category facet', function() {
            var model = new Backbone.Model({
                facets: [{name: 'dim3', type: 'all-values'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            expect(view.facet_roles.err_too_few).to.be.false;
            view.$el.find('[name="multiple_series"]').val('dim3').change();
            expect(view.facet_roles.err_too_few).to.be.true;
        });

        it('should warn if there is more than one category', function() {
            var model = new Backbone.Model({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            expect(view.facet_roles.err_too_many).to.be.false;
            view.$el.find('[name="multiple_series"]').val('').change();
            expect(view.facet_roles.err_too_many).to.be.true;
        });

        it('should mark remaining dimension as category', function() {
            var model = new Backbone.Model({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            expect(view.facet_roles.category_facet['name']).to.equal('dim4');
        });

    });

    describe('constraints between filters', function() {

        var four_dimensions = [{type_label: 'dimension', notation: 'dim1'},
                               {type_label: 'dimension', notation: 'dim2'},
                               {type_label: 'dimension', notation: 'dim3'},
                               {type_label: 'dimension', notation: 'dim4'}];

        it('should generate no constraints for first filter', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model(),
                dimensions: four_dimensions
            });
            var constr0 = view.model.toJSON()['facets'][0]['constraints'];
            expect(constr0).to.deep.equal({});
        });

        it('should generate 3 constraints for 4th filter', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model(),
                dimensions: four_dimensions
            });
            var constr3 = view.model.toJSON()['facets'][3]['constraints'];
            expect(constr3).to.deep.equal({
                'dim1': 'dim1',
                'dim2': 'dim2',
                'dim3': 'dim3'
            });
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
