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

    it('should set multidim according to chart type', function() {
        var model = new Backbone.Model();
        var editor = new App.ChartTypeEditor({model: model});
        testing.choose_radio(editor.$el.find('[name=chart-type]'), 'scatter');
        expect(model.get('multidim')).to.equal(2);
        testing.choose_radio(editor.$el.find('[name=chart-type]'), 'bubbles');
        expect(model.get('multidim')).to.equal(3);
        testing.choose_radio(editor.$el.find('[name=chart-type]'), 'columns');
        expect(model.get('multidim')).to.be.undefined;
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

    var four_dimensions = [{type_label: 'dimension', notation: 'dim1'},
                           {type_label: 'dimension', notation: 'dim2'},
                           {type_label: 'dimension', notation: 'dim3'},
                           {type_label: 'dimension', notation: 'dim4'}];

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
                'indicator-group', 'indicator', 'breakdown-group', 'breakdown',
                'unit-measure', 'ref-area', 'time-period', 'value'
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
                facets: [{name: 'time-period',
                          dimension: 'time-period',
                          type: 'multiple_select'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: [
                    {type_label: 'dimension', notation: 'indicator'},
                    {type_label: 'dimension', notation: 'time-period'}
                ]
            });
            expect(_(model.get('facets')).pluck('dimension')).to.deep.equal(
                ['time-period', 'indicator', 'value']);
        });

        it('should remove facets with no corresponding dimension', function() {
            var model = new Backbone.Model({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: []
            });
            expect(_(model.get('facets')).pluck('dimension')).to.deep.equal(
                ['value']);
        });

    });

    describe('facet type', function() {

        it('should default to "select"', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model(),
                dimensions: [{type_label: 'dimension', notation: 'dim1'}]
            });
            var facet0 = view.model.toJSON()['facets'][0];
            expect(facet0['type']).to.equal('select');
        });

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

    describe('hidden facet', function() {

        it('should not include ignore facet in constraints', function() {
            var model = new Backbone.Model({
                'facets': [{name: 'dim2', type: 'ignore'}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            expect(model.get('facets')[3]['constraints']).to.deep.equal(
                {'dim1': 'dim1', 'dim3': 'dim3'});
        });

    });

    describe('facet verification', function() {

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

        it('should write category facet on model', function() {
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
            expect(model.get('category_facet')).to.equal('dim4');
        });

    });

    describe('constraints between filters', function() {

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

        it('should generate no constraints with multiple_select', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model({
                    facets: [{name: 'dim2', type: 'multiple_select'}]
                }),
                dimensions: four_dimensions
            });
            var constr3 = view.model.toJSON()['facets'][3]['constraints'];
            expect(constr3).to.deep.equal({'dim1': 'dim1', 'dim3': 'dim3'});
        });

        it('should generate no constraints with all-values', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model({
                    facets: [{name: 'dim2', type: 'all-values'}]
                }),
                dimensions: four_dimensions
            });
            var constr3 = view.model.toJSON()['facets'][3]['constraints'];
            expect(constr3).to.deep.equal({'dim1': 'dim1', 'dim3': 'dim3'});
        });

    });

    describe('include_wildcard option', function() {

        it('should be controlled by checkbox', function() {
            var view = new NoAjaxFacetsEditor({
                model: new Backbone.Model(),
                dimensions: four_dimensions
            });
            var facet0 = function() { return view.model.get('facets')[0]; };
            view.$el.find('[name="include_wildcard"]').click().change();
            expect(facet0()['include_wildcard']).to.be.true;
            view.$el.find('[name="include_wildcard"]').click().change();
            expect(facet0()['include_wildcard']).to.be.undefined;
        });

        it('should be removed if facet is not single select', function() {
            var model = new Backbone.Model({
                facets: [{name: 'dim2', type: 'select', include_wildcard: true}]
            });
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            view.$el.find('[name="type"]').val('multiple_select').change();
            expect(model.get('facets')[0]['include_wildcard']).to.be.undefined;
        });

    });

    describe('multidim facets', function() {

        var facets_by_name = function(facets) {
            return _.object(_(facets).map(function(facet) {
                return [facet['name'], facet];
            }));
        };

        it('should generate double facets if multidim=2', function() {
            var model = new Backbone.Model({multidim: 2});
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            expect(model.get('facets')[0]['name']).to.equal('x-dim1');
            expect(model.get('facets')[1]['name']).to.equal('y-dim1');
            expect(model.get('facets')[2]['name']).to.equal('dim2');
        });

        it('multidim dimensions should depend on their axis only', function() {
            var model = new Backbone.Model({multidim: 2});
            var view = new NoAjaxFacetsEditor({
                model: model,
                dimensions: four_dimensions
            });
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            view.$el.find('[data-name="dim2"] [name="multidim"]').click().change();
            view.$el.find('[data-name="dim3"] [name="multidim"]').click().change();
            var facets = facets_by_name(model.get('facets'));
            expect(facets['x-dim2']['constraints']).to.deep.equal(
                {'dim1': 'x-dim1'});
            expect(facets['x-dim3']['constraints']).to.deep.equal(
                {'dim1': 'x-dim1', 'dim2': 'x-dim2'});
        });

    });

});


describe('AxesEditor', function() {

    var pluck_label = function(chart_meta_labels, target) {
        var needle = null;
        _(chart_meta_labels).forEach(function(item) {
            if(_(item.targets).contains(target)) {
                needle = item;
            }
        });
        return needle;
    }

    it('should set horizontal title in model', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select'},
                     {name: 'dim2', type: 'select'}]
        });
        var view = new App.AxesEditor({model: model});
        view.$el.find('[name="label-horizontal-facet"]').val('dim2').change();
        view.$el.find('[name="label-horizontal-type"]').val('short_label').change();
        var x_title_label = pluck_label(model.get('chart_meta_labels'), 'x_title');
        expect(x_title_label['filter_name']).to.equal('dim2');
        expect(x_title_label['type']).to.equal('short_label');
    });

    it('should set vertical title in model', function() {
        var model = new Backbone.Model();
        var view = new App.AxesEditor({model: model});
        var y_title_label = pluck_label(model.get('chart_meta_labels'), 'y_title');
        expect(y_title_label['filter_name']).to.equal('unit-measure');
        expect(y_title_label['type']).to.equal('short_label');
    });

    it('should display current values', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select'},
                     {name: 'dim2', type: 'select'}],
            chart_meta_labels: [
                {targets: ['x_title'],
                 filter_name: 'dim2',
                 type: 'short_label'},
                {targets: ['y_title', 'unit'],
                 filter_name: 'unit-measure',
                 type: 'short_label'}
            ]
        });
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="label-horizontal-facet"]').val())
            .to.equal('dim2');
        expect(view.$el.find('[name="label-horizontal-type"]').val())
            .to.equal('short_label');
    });

});


describe('AnnotationsEditor', function() {

    it('should add selected items to model', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select'},
                     {name: 'dim2', type: 'select'}],
        });
        var view = new App.AnnotationsEditor({model: model});
        view.$el.find('[name="annotation"][value="dim2"]').click().change();
        var names = _(model.get('annotations')['filters']).pluck('name');
        expect(names).to.not.contain('dim1');
        expect(names).to.contain('dim2');
    });

    it('should preselect checkboxes with current value', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select'},
                     {name: 'dim2', type: 'select'}],
            annotations: {filters: [{name: 'dim2'}]}
        });
        var view = new App.AnnotationsEditor({model: model});
        var get_checkbox = function(name) {
            return view.$el.find('[name="annotation"][value="' + name + '"]');
        }
        expect(get_checkbox('dim1').is(':checked')).to.be.false;
        expect(get_checkbox('dim2').is(':checked')).to.be.true;
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
