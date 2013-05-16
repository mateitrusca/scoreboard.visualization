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

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    var four_dimensions = [
        {type_label: 'dimension', notation: 'dim1', label: "Dim 1"},
        {type_label: 'dimension', notation: 'dim2', label: "Dim 2"},
        {type_label: 'dimension', notation: 'dim3', label: "Dim 3"},
        {type_label: 'dimension', notation: 'dim4', label: "Dim 4"}];

    describe('facet list', function() {

        it('should prefill dimensions', function() {
            var model = new App.EditorConfiguration({}, {
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
            var view = new App.FacetsEditor({model: model});

            expect(_(model.get('facets')).pluck('dimension')).to.deep.equal([
                'indicator-group', 'indicator', 'breakdown-group', 'breakdown',
                'unit-measure', 'ref-area', 'time-period', 'value'
            ]);
        });

        it('should save filter name same as dimension', function() {
            var model = new App.EditorConfiguration({}, {
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var view = new App.FacetsEditor({model: model});
            expect(model.get('facets')[0]['name']).to.equal('time-period');
            expect(model.get('facets')[0]['dimension']).to.equal('time-period');
        });

        it('should save filter type', function() {
            var model = new App.EditorConfiguration({}, {
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var view = new App.FacetsEditor({model: model});
            view.$el.find('select[name="type"]').val('multiple_select').change();
            expect(model.get('facets')[0]['type']).to.equal('multiple_select');
        });

        it('should create missing facets when loading config', function() {
            var model = new App.EditorConfiguration({
                facets: [{name: 'time-period',
                          dimension: 'time-period',
                          type: 'multiple_select'}]
            }, {
                dimensions: [
                    {type_label: 'dimension', notation: 'indicator'},
                    {type_label: 'dimension', notation: 'time-period'}
                ]
            });
            var view = new App.FacetsEditor({model: model});
            expect(_(model.get('facets')).pluck('dimension')).to.deep.equal(
                ['time-period', 'indicator', 'value']);
        });

        it('should remove facets with no corresponding dimension', function() {
            var model = new App.EditorConfiguration({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            }, {dimensions: []});
            var view = new App.FacetsEditor({model: model});
            expect(_(model.get('facets')).pluck('dimension')).to.deep.equal(
                ['value']);
        });

    });

    describe('facet type', function() {

        it('should default to "select"', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({}, {
                    dimensions: [{type_label: 'dimension', notation: 'dim1'}]
                })
            });
            var facet0 = view.model.toJSON()['facets'][0];
            expect(facet0['type']).to.equal('select');
        });

        it('should select existing filter type', function() {
            var model = new App.EditorConfiguration({
                facets: [{name: 'time-period', type: 'multiple_select'}]
            }, {
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var view = new App.FacetsEditor({model: model});
            var select = view.$el.find('select[name="type"]');
            expect(select.val()).to.equal('multiple_select');
        });

    });

    describe('multiple series', function() {

        it('should display list of series options', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({
                    facets: [
                        {name: 'dim3', type: 'all-values'},
                        {name: 'dim4', type: 'all-values'}
                    ]
                }, {dimensions: four_dimensions}),
            });
            var options = view.$el.find('[name="multiple_series"] option');
            var series_options = _(options).map(function(opt) {
                return $(opt).attr('value');
            });
            expect(series_options).to.deep.equal(['', 'dim3', 'dim4']);
        });

        it('should update model with selection', function() {
            var model = new App.EditorConfiguration({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ]
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            expect(model.get('multiple_series')).to.be.null;
            view.$el.find('[name="multiple_series"]').val('dim3').change();
            expect(model.get('multiple_series')).to.equal('dim3');
        });

        it('should render multiple_series with selected value', function() {
            var model = new App.EditorConfiguration({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            var select = view.$el.find('[name="multiple_series"]');
            expect(select.val()).to.equal('dim3');
        });

    });

    describe('hidden facet', function() {

        it('should not include ignore facet in constraints', function() {
            var model = new App.EditorConfiguration({
                'facets': [{name: 'dim2', type: 'ignore'}]
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            expect(model.get('facets')[3]['constraints']).to.deep.equal(
                {'dim1': 'dim1', 'dim3': 'dim3'});
        });

    });

    describe('facet verification', function() {

        it('should warn if there is no category facet', function() {
            var model = new App.EditorConfiguration({
                facets: [{name: 'dim3', type: 'all-values'}]
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            expect(view.facet_roles.err_too_few).to.be.false;
            view.$el.find('[name="multiple_series"]').val('dim3').change();
            expect(view.facet_roles.err_too_few).to.be.true;
        });

        it('should warn if there is more than one category', function() {
            var model = new App.EditorConfiguration({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            expect(view.facet_roles.err_too_many).to.be.false;
            view.$el.find('[name="multiple_series"]').val('').change();
            expect(view.facet_roles.err_too_many).to.be.true;
        });

        it('should mark remaining dimension as category', function() {
            var model = new App.EditorConfiguration({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            expect(view.facet_roles.category_facet['name']).to.equal('dim4');
        });

        it('should write category facet on model', function() {
            var model = new App.EditorConfiguration({
                facets: [
                    {name: 'dim3', type: 'all-values'},
                    {name: 'dim4', type: 'all-values'}
                ],
                multiple_series: 'dim3'
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            expect(model.get('category_facet')).to.equal('dim4');
        });

    });

    describe('constraints between filters', function() {

        it('should generate no constraints for first filter', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({}, {
                    dimensions: four_dimensions})});
            var constr0 = view.model.toJSON()['facets'][0]['constraints'];
            expect(constr0).to.deep.equal({});
        });

        it('should generate 3 constraints for 4th filter', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({}, {
                    dimensions: four_dimensions})});
            var constr3 = view.model.toJSON()['facets'][3]['constraints'];
            expect(constr3).to.deep.equal({
                'dim1': 'dim1',
                'dim2': 'dim2',
                'dim3': 'dim3'
            });
        });

        it('should generate no constraints with multiple_select', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({
                    facets: [{name: 'dim2', type: 'multiple_select'}]
                }, {dimensions: four_dimensions})
            });
            var constr3 = view.model.toJSON()['facets'][3]['constraints'];
            expect(constr3).to.deep.equal({'dim1': 'dim1', 'dim3': 'dim3'});
        });

        it('should generate no constraints with all-values', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({
                    facets: [{name: 'dim2', type: 'all-values'}]
                }, {dimensions: four_dimensions})
            });
            var constr3 = view.model.toJSON()['facets'][3]['constraints'];
            expect(constr3).to.deep.equal({'dim1': 'dim1', 'dim3': 'dim3'});
        });

    });

    describe('include_wildcard option', function() {

        it('should be controlled by checkbox', function() {
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({}, {
                    dimensions: four_dimensions})});
            var facet0 = function() { return view.model.get('facets')[0]; };
            view.$el.find('[name="include_wildcard"]').click().change();
            expect(facet0()['include_wildcard']).to.be.true;
            view.$el.find('[name="include_wildcard"]').click().change();
            expect(facet0()['include_wildcard']).to.be.undefined;
        });

        it('should be removed if facet is not single select', function() {
            var model = new App.EditorConfiguration({
                facets: [{name: 'dim2', type: 'select', include_wildcard: true}]
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
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
            var model = new App.EditorConfiguration({multidim: 2}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            expect(model.get('facets')[0]['name']).to.equal('x-dim1');
            expect(model.get('facets')[1]['name']).to.equal('y-dim1');
            expect(model.get('facets')[2]['name']).to.equal('dim2');
        });

        it('multidim dimensions should depend on their axis only', function() {
            var model = new App.EditorConfiguration({multidim: 2}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            view.$el.find('[data-name="dim2"] [name="multidim"]').click().change();
            view.$el.find('[data-name="dim3"] [name="multidim"]').click().change();
            var facets = facets_by_name(model.get('facets'));
            expect(facets['x-dim2']['constraints']).to.deep.equal(
                {'dim1': 'x-dim1'});
            expect(facets['x-dim3']['constraints']).to.deep.equal(
                {'dim1': 'x-dim1', 'dim2': 'x-dim2'});
        });

        it('subsequent dimensions depend on all multidim axes', function() {
            var model = new App.EditorConfiguration({multidim: 2}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            view.$el.find('[data-name="dim2"] [name="multidim"]').click().change();
            var facets = facets_by_name(model.get('facets'));
            expect(facets['dim3']['constraints']).to.deep.equal({
                'x-dim1': 'x-dim1', 'x-dim2': 'x-dim2',
                'y-dim1': 'y-dim1', 'y-dim2': 'y-dim2'});
            expect(facets['dim4']['constraints']).to.deep.equal({
                'x-dim1': 'x-dim1', 'x-dim2': 'x-dim2',
                'y-dim1': 'y-dim1', 'y-dim2': 'y-dim2',
                'dim3': 'dim3'});
        });

        it('should set multidim_common on non-multidim facets', function() {
            var model = new App.EditorConfiguration({multidim: 2}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            var facets = facets_by_name(model.get('facets'));
            expect(facets['x-dim1']['multidim_common']).to.be.undefined;
            expect(facets['dim3']['multidim_common']).to.be.true;
        });

        it('should set multidim_value on value facet', function() {
            var model = new App.EditorConfiguration({multidim: 2}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            var facets = facets_by_name(model.get('facets'));
            expect(facets['value']['multidim_value']).to.be.true;
        });

        it('should parse multidim facets and preserve labels', function() {
            var model = new App.EditorConfiguration({
                multidim: 2,
                facets: [
                    {name: 'x-dim1', label: '(X) blah dim1'},
                    {name: 'y-dim1', label: '(Y) ignored dim1'},
                    {name: 'x-dim2', label: '(X) blah dim2'},
                    {name: 'y-dim2', label: '(Y) ignored dim2'},
                    {name: 'dim3', label: 'blah dim3'},
                    {name: 'dim4', label: 'blah dim4'}
                ]
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            var facets = facets_by_name(model.get('facets'));
            expect(facets['x-dim1'].label).to.equal('(X) blah dim1');
            expect(facets['y-dim1'].label).to.equal('(Y) blah dim1');
            expect(facets['x-dim2'].label).to.equal('(X) blah dim2');
            expect(facets['y-dim2'].label).to.equal('(Y) blah dim2');
            expect(facets['dim3'].label).to.equal('blah dim3');
            expect(facets['dim4'].label).to.equal('blah dim4');
        });

        it('should order multidim facets grouped by axis', function() {
            var model = new App.EditorConfiguration({multidim: 2}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[data-name="dim1"] [name="multidim"]').click().change();
            view.$el.find('[data-name="dim2"] [name="multidim"]').click().change();
            expect(_(model.get('facets')).pluck('name')).to.deep.equal(
                ['x-dim1', 'x-dim2', 'y-dim1', 'y-dim2',
                 'dim3', 'dim4', 'value']);
        });

    });

});


describe('AxesEditor', function() {

    it('should set vertical title in model', function() {
        var model = new Backbone.Model({
            facets: [{name: 'unit-measure', type: 'select'}]
        });
        var view = new App.AxesEditor({model: model});
        var ordinate_label = model.get('labels')['ordinate'];
        expect(ordinate_label['facet']).to.equal('unit-measure');
        expect(ordinate_label['field']).to.equal('short_label');
    });

});


describe('SeriesEditor', function() {

    var all_dimensions = [
        {type_label: 'measure', notation: null},
        {type_label: 'attribute', notation: 'unit-measure'},
        {type_label: 'attribute', notation: 'flag'},
        {type_label: 'attribute', notation: 'note'},
        {type_label: 'dimension group', notation: 'indicator-group'},
        {type_label: 'dimension', notation: 'indicator'},
        {type_label: 'dimension group', notation: 'breakdown-group'},
        {type_label: 'dimension', notation: 'breakdown'},
        {type_label: 'dimension', notation: 'unit-measure'},
        {type_label: 'dimension', notation: 'ref-area'},
        {type_label: 'dimension', notation: 'time-period'}
    ];

    beforeEach(function() {
        this.model = new App.EditorConfiguration({}, {
            dimensions: all_dimensions});
    });

    it('should display checkboxes for relevant dimensions', function() {
        var view = new App.SeriesEditor({model: this.model});
        expect(view.$el.find('[value="flag"]').length).to.equal(1);
        expect(view.$el.find('[value="note"]').length).to.equal(1);
        expect(view.$el.find('[value="unit-measure"]').length).to.equal(1);
        expect(view.$el.find('[value="breakdown"]').length).to.equal(0);
        expect(view.$el.find('[value="breakdown-group"]').length).to.equal(0);
    });

    it('should save value from checkboxes', function() {
        var view = new App.SeriesEditor({model: this.model});
        view.$el.find('[value="note"]').click().change();
        expect(this.model.get('tooltips')['note']).to.be.true;
    });

    it('should precheck checkboxes', function() {
        this.model.set('tooltips', {note: true});
        var view = new App.SeriesEditor({model: this.model});
        expect(view.$el.find('[value="note"]').is(':checked')).to.be.true;
        expect(view.$el.find('[value="flag"]').is(':checked')).to.be.false;
    });

});


describe('FormatEditor', function() {

    it('should set title and subtitle in model', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select'},
                     {name: 'dim2', type: 'select'},
                     {name: 'dim3', type: 'select'}]
        });
        var view = new App.FormatEditor({model: model});
        var $title_el = view.$el.find('[data-label="title"]');
        $title_el.find('[name="facet"]').val('dim2').change();
        $title_el.find('[name="field"]').val('short_label').change();
        var $subtitle_el = view.$el.find('[data-label="subtitle"]');
        $subtitle_el.find('[name="facet"]').val('dim3').change();
        $subtitle_el.find('[name="field"]').val('short_label').change();
        var title_label = model.get('labels')['title'];
        expect(title_label['facet']).to.equal('dim2');
        expect(title_label['field']).to.equal('short_label');
        var subtitle_label = model.get('labels')['subtitle'];
        expect(subtitle_label['facet']).to.equal('dim3');
        expect(subtitle_label['field']).to.equal('short_label');
    });

    it('should display current title and subtitle values', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select'},
                     {name: 'dim2', type: 'select'},
                     {name: 'dim3', type: 'select'}],
            labels: {title: {facet: 'dim2', field: 'short_label'},
                     subtitle: {facet: 'dim3', field: 'short_label'}}
        });
        var view = new App.FormatEditor({model: model});
        var $title_el = view.$el.find('[data-label="title"]');
        expect($title_el.find('[name="facet"]').val()).to.equal('dim2');
        expect($title_el.find('[name="field"]').val())
            .to.equal('short_label');
        var $subtitle_el = view.$el.find('[data-label="subtitle"]');
        expect($subtitle_el.find('[name="facet"]').val()).to.equal('dim3');
        expect($subtitle_el.find('[name="field"]').val())
            .to.equal('short_label');
    });

    it('should save chart height', function() {
        var view = new App.FormatEditor({model: new Backbone.Model()});
        view.$el.find('[name="height"]').val('123').change();
        expect(view.model.get('height')).to.equal('123');
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
