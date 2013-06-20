/*global App, Backbone, _, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('ChartTypeEditor', function() {
    "use strict";

    var testing = App.testing;

    it('should save first value as default', function() {
        var model = new Backbone.Model();
        var editor = new App.ChartTypeEditor({model: model});
        expect(model.get('chart_type')).to.equal('lines');
    });

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

    it('should save animation choice', function() {
        var view = new App.ChartTypeEditor({model: new Backbone.Model({
            chart_type: 'columns'})});
        view.$el.find('[name="animation"]').click().change();
        expect(view.model.get('animation')).to.be.true;
    });

    it('should show existing animation choice', function() {
        var model = new Backbone.Model({animation: true, chart_type: 'columns'});
        var view = new App.ChartTypeEditor({model: model});
        expect(view.$el.find('[name="animation"]').is(':checked')).to.be.true;
    });

    it('should draw animation checkbox for relevant chart types', function() {
        var view = new App.ChartTypeEditor({model: new Backbone.Model({
            chart_type: 'columns'})});
        expect(view.$el.find('[name="animation"]').length).to.equal(1);
        var view = new App.ChartTypeEditor({model: new Backbone.Model({
            chart_type: 'lines'})});
        expect(view.$el.find('[name="animation"]').length).to.equal(0);
    });

});


describe('FacetsEditor', function() {
    "use strict";

    var $ = App.jQuery;

    beforeEach(function() {
        this.sandbox = sinon.sandbox.create();
        this.sandbox.useFakeServer();
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

        it('should save filter name same as dimension by default', function() {
            var model = new App.EditorConfiguration({}, {
                dimensions: [{type_label: 'dimension', notation: 'time-period'}]
            });
            var view = new App.FacetsEditor({model: model});
            expect(model.get('facets')[0]['name']).to.equal('time-period');
            expect(model.get('facets')[0]['dimension']).to.equal('time-period');
        });

        it('should save the provided filter name', function() {
            var model = new App.EditorConfiguration({}, {
                dimensions: [{type_label: 'dimension', notation: 'indicator'},
                             {type_label: 'dimension', notation: 'time-period'}]
            });
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[name="name"]:eq(0)').val('ind').trigger('input');
            view.$el.find('[name="name"]:eq(1)').val('period').trigger('keyup');
            view.$el.find('[name="name"]:eq(0)').trigger('focusout');
            view.$el.find('[name="name"]:eq(1)').trigger('focusout');
            expect(model.get('facets')[0]['name']).to.equal('ind');
            expect(model.get('facets')[1]['name']).to.equal('period');
            expect(model.get('facets')[0]['dimension']).to.equal('indicator');
            expect(model.get('facets')[1]['dimension']).to.equal('time-period');
        });

        it('should save filter name same as dimension when empty', function() {
            var model = new App.EditorConfiguration({}, {
                dimensions: [{type_label: 'dimension', notation: 'indicator'}]});
            var view = new App.FacetsEditor({model: model});
            view.$el.find('[name="name"]:eq(0)').val('').trigger('input');
            view.$el.find('[name="name"]:eq(0)').trigger('focusout');
            expect(model.get('facets')[0]['name']).to.equal('indicator');
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

    describe('facet ignore values', function() {
        it('should update model with values selected', function() {
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'dim1', type: 'select'},
                        {name: 'dim2', type: 'multiple_select'}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'dim1'},
                        {type_label: 'dimension', notation: 'dim2'}]
                });
            var view = new App.FacetsEditor({model: model});
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            expect(model.facets.models[0].get('ignore_values')).to.be.undefined;
            App.respond_json(server.requests[1], {'options': options});
            view.$el.find('[name="ignore_values"]:first').val(['one', 'two']).change();
            expect(model.facets.models[0].get('ignore_values')).to.deep.equal(['one', 'two']);
            view.$el.find('[name="ignore_values"]:eq(1)').val(['one']).change();
            expect(model.facets.models[1].get('ignore_values')).to.deep.equal(['one']);
        });
    });

    describe('facet default value', function() {
        it('should have no default_value by default', function() {
            this.sandbox.useFakeServer();
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'time-period', type: 'select'}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'time-period'}]
                });
            var view = new App.FacetsEditor({model: model});
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            var facet0 = view.model.toJSON()['facets'][0];
            expect(facet0['default_value']).to.be.undefined;
        });

        it('should select existing default_value', function() {
            this.sandbox.useFakeServer();
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'time-period', type: 'select', default_value: ['one']}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'time-period'}]
                });
            var view = new App.FacetsEditor({model: model});
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            var facet0 = view.model.toJSON()['facets'][0];
            expect(facet0['default_value']).to.deep.equal(['one']);
        });

        it('should remove existing default_value', function() {
            this.sandbox.useFakeServer();
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'time-period', type: 'select', default_value: ['one']}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'time-period'}]
                });
            var view = new App.FacetsEditor({model: model});
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            view.$el.find('[name="default_value"]:first').val([]).change();
        });

        it('should update model with values selected', function() {
            this.sandbox.useFakeServer();
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'dim1', type: 'select'},
                        {name: 'dim2', type: 'multiple_select'}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'dim1'},
                        {type_label: 'dimension', notation: 'dim2'}]
                });
            var view = new App.FacetsEditor({model: model});
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            expect(model.facets.models[0].get('default_value')).to.be.undefined;
            App.respond_json(server.requests[1], {'options': options});
            view.$el.find('[name="default_value"]:first').val(['two']).change();
            expect(model.facets.models[0].get('default_value')).to.deep.equal(['two']);
            view.$el.find('[name="default_value"]:eq(1)').val(['one']).change();
            expect(model.facets.models[1].get('default_value')).to.deep.equal(['one']);
        });

        it('should unset default_value from model', function(){
            this.sandbox.useFakeServer();
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'dim1', type: 'select'}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'dim1'}
                    ]
                });
            var view = new App.FacetsEditor({model: model});
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            expect(model.facets.models[0].get('default_value')).to.be.undefined;
            view.$el.find('[name="default_value"]:first').val(['two']).change();
            expect(model.facets.models[0].get('default_value')).to.deep.equal(['two']);
            view.$el.find('[name="default_value"]:first').val([]).change();
            expect(model.facets.models[0].get('default_value')).to.be.undefined;
        });

    });

    describe('facet position', function() {

        it('should update model with selection', function() {
            var model = new App.EditorConfiguration({
                    facets: [
                        {name: 'dim1', type: 'select'}
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'time-period'}]
                });
            var view = new App.FacetsEditor({model: model});
            expect(model.facets.first().get('position')).to.be.undefined;
            view.$el.find('[name="position"]').val('upper-right').change();
            expect(model.facets.first().get('position')).to.equal(
                'upper-right');
        });

        it('should select existing filter position', function(){
            var view = new App.FacetsEditor({
                    model: new App.EditorConfiguration({
                        facets: [
                            {name: 'time-period', position: 'upper-left'}]
                    }, {
                        dimensions: [
                            {type_label: 'dimension', notation: 'time-period'}]
                    })
            });
            var facet0 = view.model.toJSON()['facets'][0];
            expect(facet0['position']).to.equal('upper-left');
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

    describe('highlights', function() {

        it('should display existing values', function() {
            this.sandbox.useFakeServer();
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({
                    facets: [
                        {name: 'dim1', type: 'multiple_select'},
                    ],
                    highlights: [
                        'two'
                    ]
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'dim1'}
                    ]
                })
            });
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            var select = view.$el.find('[name="highlights"]');
            expect(select.val()).to.deep.equal(['two']);
        }),

        it('should update model with values selected', function() {
            this.sandbox.useFakeServer();
            var view = new App.FacetsEditor({
                model: new App.EditorConfiguration({
                    facets: [
                        {name: 'dim1', type: 'multiple_select'},
                    ],
                }, {
                    dimensions: [
                        {type_label: 'dimension', notation: 'dim1'}
                    ]
                })
            });
            var server = this.sandbox.server;
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            var select = view.$el.find('[name="highlights"]');
            select.val(['one']).change();
            expect(view.model.attributes.highlights).to.deep.equal(['one']);
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

    describe('sort facet options', function() {

        it('should save selected values', function() {
            var model = new App.EditorConfiguration({}, {
                dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            var $dim2_el = view.$el.find('[data-name="dim2"]');
            $dim2_el.find('[name="sort-by"]').val('notation').change();
            $dim2_el.find('[name="sort-order"]').val('reverse').change();
            var dim2 = _(model.get('facets')).findWhere({name: 'dim2'});
            expect(dim2['sortBy']).to.equal('notation');
            expect(dim2['sortOrder']).to.equal('reverse');
        });

        it('should display selected values', function() {
            var model = new App.EditorConfiguration({
                facets: [
                    {name: 'dim2', sortBy: 'notation', sortOrder: 'reverse'}]
            }, {dimensions: four_dimensions});
            var view = new App.FacetsEditor({model: model});
            var $dim2_el = view.$el.find('[data-name="dim2"]');
            expect($dim2_el.find('[name="sort-by"]').val()).to.equal('notation');
            expect($dim2_el.find('[name="sort-order"]').val()).to.equal('reverse');
        });

    });

});


describe('AxesEditor', function() {

    describe('TitleComposer', function(){
        it('should present title choices to user', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'breakdown', type: 'select'},
                    {name: 'indicator', type: 'select', dimension: 'indicator'},
                    {name: 'ref-area', type: 'multiple_select'}
                ]
            });
            var view = new App.AxesEditor({model: model});
            var select = view.composers_views.title.$el.find('[name="title-part"]');
            var options = select.find('option', '[name="title"]');
            expect(options.length).to.equal(3);
            expect(select.val()).to.equal('indicator');
        });

        it('should not present title choices to user', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ref-area', type: 'multiple_select'}
                ]
            });
            var view = new App.AxesEditor({model: model});
            var select = view.composers_views.title.$el.find('[name="title-part"]');
            expect(select.val()).to.equal(undefined);
        });

        it('should save default title to model', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                    {name: 'ref-area', type: 'multiple_select', value: 'ref-area'}
                ]
            });
            var view = new App.AxesEditor({model: model});
            var select = view.composers_views.title.$el.find('[name="title-part"]');
            expect(view.model.get('titles')['title']).to.deep.equal([
                {facet_name: 'ind', separator: null, format: 'short_label'}]);
        });

        it('should save selected title to model', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                    {name: 'ref-area', type: 'multiple_select', value: 'ref-area'}
                ]
            });
            var view = new App.AxesEditor({model: model});
            var select = view.composers_views.title.$el.find('[name="title-part"]');
            select.val('brk').change();
            expect(view.model.get('titles')['title']).to.deep.equal([
                {facet_name: 'brk', separator: null, format: 'short_label'}
            ]);
        });

        it('should render a new title part', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                ]
            });
            var view = new App.AxesEditor({model: model});
            var add_button = view.composers_views.title.$el.find('[name="add-title-part"]');
            add_button.click();
            var models = view.composers_views.title.parts.models;
            var views = view.composers_views.title.part_views;
            expect(_(models).pluck('cid')).to.deep.equal(_(views).keys());
            var select = view.composers_views.title.$el.find('[name="title-part"]');
            expect(select.length).to.deep.equal(2);
        });

        it('should save all title parts to model', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                ]
            });
            var view = new App.AxesEditor({model: model});
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            var add_button = view.composers_views.title.$el.find('[name="add-title-part"]');
            select.val('ind').change();
            add_button.click();
            var models = view.composers_views.title.parts.models;
            var views = view.composers_views.title.part_views;
            expect(_(models).pluck('cid')).to.deep.equal(_(views).keys());
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(1)');
            select.val('brk').change();
            expect(view.model.get('titles')['title']).to.deep.equal(
                [{facet_name: 'ind', separator: null, format: 'short_label'},
                 {facet_name: 'brk', separator: null, format: 'short_label'}]);
        });

        it('should render separator options', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                ]
            });
            var view = new App.AxesEditor({model: model});
            var add_button = view.composers_views.title.$el.find('[name="add-title-part"]');
            add_button.click();
            var separator = view.composers_views.title.$el.find(
                '[name="title-part-separator"]');
            var opts = separator.find('option');
            expect(opts.length).to.equal(4);
            expect(separator.val()).to.equal("");
        });

        it('should save selected separators', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                ]
            });
            var view = new App.AxesEditor({model: model});
            var add_button = view.composers_views.title.$el.find('[name="add-title-part"]');
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            select.val('ind').change();
            add_button.click();
            var separator = view.composers_views.title.$el.find(
                '[name="title-part-separator"]');
            separator.val(' by ').change();
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(1)');
            select.val('brk').change();
            expect(view.model.get('titles')['title']).to.deep.equal(
                [ {facet_name: 'ind', separator: null, format: 'short_label'},
                  {separator: ' by ', facet_name: 'brk', format: 'short_label'}]);
        });

        it('should display existing title parts', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                ],
                titles: {
                    title: [{facet_name: "ind"},
                            {separator: ', ', facet_name: "brk"} ]
                }
            });
            var view = new App.AxesEditor({model: model});
            var select1 = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            var separator = view.composers_views.title.$el.find(
                '[name="title-part-separator"]');
            var select2 = view.composers_views.title.$el.find('[name="title-part"]:eq(1)');
            expect(select1.val()).to.equal('ind');
            expect(separator.val()).to.equal(', ');
            expect(select2.val()).to.equal('brk');
        });

        it('should validate existing title parts', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'multiple_select', value: 'breakdown'},
                ],
                titles: {
                    title: [{facet_name: "ind"},
                            {separator: ',', facet_name: "brk"} ]
                }
            });
            var view = new App.AxesEditor({model: model});
            var select1 = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            var separator = view.composers_views.title.$el.find(
                '[name="title-part-separator"]');
            var select2 = view.composers_views.title.$el.find('[name="title-part"]:eq(1)');
            expect(select1.val()).to.equal('ind');
            expect(separator.length).to.equal(0);
            expect(select2.length).to.equal(0);
            expect(view.model.get('titles')['title']).to.deep.equal(
                [{facet_name: 'ind', separator: null, format: 'short_label'}]);
        })

        it('should never add separator to the first title part', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'multiple_select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                ],
                titles: {
                    title: [{facet_name: "ind"},
                            {separator: ',', facet_name: "brk"}]
                }
            });
            var view = new App.AxesEditor({model: model});
            var select1 = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            var separator = view.composers_views.title.$el.find(
                '[name="title-part-separator"]');
            var select2 = view.composers_views.title.$el.find('[name="title-part"]:eq(1)');
            expect(select1.val()).to.equal('brk');
            expect(separator.length).to.equal(0);
            expect(select2.length).to.equal(0);
            expect(view.model.get('titles')['title']).to.deep.equal(
                [{facet_name: 'brk', separator: null, format: 'short_label'}]);
        });

        it('should remove title part when empty facet name', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                    {name: 'area', type: 'select', value: 'ref-area'}
                ],
                titles: {
                    title: [{facet_name: "ind"},
                            {separator: ',', facet_name: "brk"} ],
                }
            });
            var view = new App.AxesEditor({model: model});
            var select2 = view.composers_views.title.$el.find(
                                '[name="title-part"]:eq(1)');
            var select3 = view.composers_views.title.$el.find(
                                '[name="title-part"]:eq(2)');
            select2.val("").change();
            select3.val("").change();
            expect(view.model.get('titles')['title']).to.deep.equal(
                [{facet_name: 'ind', separator: null, format: 'short_label'}]);
        })

        it('should update labels section on model', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'},
                    {name: 'brk', type: 'select', value: 'breakdown'},
                    {name: 'area', type: 'select', value: 'ref-area'}
                ],
            });
            var view = new App.AxesEditor({model: model});
            var add_button = view.composers_views.title.$el.find('[name="add-title-part"]');
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            select.val('ind').change();
            add_button.click();
            var separator = view.composers_views.title.$el.find(
                '[name="title-part-separator"]');
            separator.val(' by ').change();
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(1)');
            select.val('brk').change();
            expect(view.model.get('titles').title).to.deep.equal([
                {facet_name: 'ind', separator: null, format: 'short_label'},
                {facet_name: 'brk', separator: ' by ', format: 'short_label'}
            ]);
            expect(view.model.get('labels')).to.deep.equal({
                "ind": {
                  "facet": "ind",
                  "field": "short_label"
                },
                "brk": {
                  "facet": "brk",
                  "field": "short_label"
                },
            })
        })

        it('should save parts with default format', function(){
            var model = new Backbone.Model({
                facets: [
                    {name: 'ind', type: 'select', value: 'indicator'}
                ],
            });
            var view = new App.AxesEditor({model: model});
            var select = view.composers_views.title.$el.find('[name="title-part"]:eq(0)');
            select.val('ind').change();
            expect(view.model.get('titles').title).to.deep.equal([
                {facet_name: 'ind', format: 'short_label', separator: null}
            ]);
        });
    });

    it('should set vertical title in model', function() {
        var model = new Backbone.Model({
            facets: [{name: 'unit-measure', type: 'select'}]
        });
        var view = new App.AxesEditor({model: model});
        var ordinate_label = model.get('labels')['ordinate'];
        expect(ordinate_label['facet']).to.equal('unit-measure');
        expect(ordinate_label['field']).to.equal('short_label');
    });

    it('should save axes sort criteria choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-sort-by"][value="category"]').click().change();
        expect(view.model.get('sort')['by']).to.equal('category');
    });

    it('should show existing axes sort criteria choice', function() {
        var model = new Backbone.Model({sort: {by: 'category'}});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-sort-by"]:checked').val()
            ).to.equal('category');
    });

    it('should save axes sort order choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-sort-order"][value="-1"]').click().change();
        expect(view.model.get('sort')['order']).to.equal(-1);
    });

    it('should show existing axes sort order choice', function() {
        var model = new Backbone.Model({sort: {order: -1}});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-sort-order"]:checked').val()
            ).to.equal('-1');
    });

    it('should save sort each series choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-sort-each-series"]').click().change();
        expect(view.model.get('sort')['each_series']).to.be.true;
    });

    it('should show existing sort each series choice', function() {
        var model = new Backbone.Model({sort: {each_series: true}});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-sort-each-series"]').is(':checked')
            ).to.be.true;
    });

    it('should save axes horizontal title choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-horizontal-title"]').val('short').change();
        expect(view.model.get('axis-horizontal-title')).to.equal('short');
    });

    it('should show existing axes horizontal title choice', function() {
        var model = new Backbone.Model({'axis-horizontal-title': 'short'});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-horizontal-title"]').val()
            ).to.equal('short');
    });

    it('should save axes horizontal rotated choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-horizontal-rotated"]').click().change();
        expect(view.model.get('axis-horizontal-rotated')).to.be.true;
    });

    it('should show existing axes horizontal rotated choice', function() {
        var model = new Backbone.Model({'axis-horizontal-rotated': true});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-horizontal-rotated"]').is(':checked')
            ).to.be.true;
    });

    it('should save axes vertical title choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-vertical-title"]').val('short').change();
        expect(view.model.get('axis-vertical-title')).to.equal('short');
    });

    it('should show existing axes vertical title choice', function() {
        var model = new Backbone.Model({'axis-vertical-title': 'short'});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-vertical-title"]').val()
            ).to.equal('short');
    });

    it('should save horizontal plotlines choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-horizontal-plotline"]'
            ).val('values').change();
        expect(view.model.get('plotlines')['x']).to.equal('values');
    });

    it('should show existing horizontal plotlines choice', function() {
        var model = new Backbone.Model({'plotlines': {x: 'values'}});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-horizontal-plotline"]').val()
            ).to.equal('values');
    });

    it('should save vertical plotlines choice', function() {
        var view = new App.AxesEditor({model: new Backbone.Model()});
        view.$el.find('[name="axis-vertical-plotline"]'
            ).val('values').change();
        expect(view.model.get('plotlines')['y']).to.equal('values');
    });

    it('should show existing vertical plotlines choice', function() {
        var model = new Backbone.Model({'plotlines': {y: 'values'}});
        var view = new App.AxesEditor({model: model});
        expect(view.$el.find('[name="axis-vertical-plotline"]').val()
            ).to.equal('values');
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
        this.model.set('tooltips', {note: false});
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

    it('should precheck all checkboxes at first', function() {
        var view = new App.SeriesEditor({model: this.model});
        expect(view.$el.find('[value="unit-measure"]').is(':checked')).to.be.true;
        expect(view.$el.find('[value="note"]').is(':checked')).to.be.true;
        expect(view.$el.find('[value="flag"]').is(':checked')).to.be.true;
    });

    it('should set tooltips to an empty dict when uncheching all', function() {
        this.model.set('tooltips', {note: true});
        var view = new App.SeriesEditor({model: this.model});
        view.$el.find('[value="note"]').click().change();
        expect(this.model.toJSON()['tooltips']).to.deep.equal(_.object());
    });

    it('should leave checkboxes unchanged if previously unchecked', function() {
        this.model.set('tooltips', {});
        var view = new App.SeriesEditor({model: this.model});
        expect(view.$el.find('[value="unit-measure"]').is(':checked')).to.be.false;
        expect(view.$el.find('[value="note"]').is(':checked')).to.be.false;
        expect(view.$el.find('[value="flag"]').is(':checked')).to.be.false;
    });

    it('should save legend choice', function() {
        var view = new App.SeriesEditor({model: this.model});
        view.$el.find('[name="legend-label"]').val('long').change();
        expect(this.model.get('series-legend-label')).to.equal('long');
    });

    it('should show existing legend choice', function() {
        this.model.set('series-legend-label', 'long');
        var view = new App.SeriesEditor({model: this.model});
        expect(view.$el.find('[name="legend-label"]').val()).to.equal('long');
    });

    it('should save point label choice', function() {
        var view = new App.SeriesEditor({model: this.model});
        view.$el.find('[name="point-label"]').val('long').change();
        expect(this.model.get('series-point-label')).to.equal('long');
    });

    it('should show existing point label choice', function() {
        this.model.set('series-point-label', 'long');
        var view = new App.SeriesEditor({model: this.model});
        expect(view.$el.find('[name="point-label"]').val()).to.equal('long');
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

    it('should display existing chart height', function() {
        var view = new App.FormatEditor({model: new Backbone.Model({
            height: '123'
        })});
        expect(view.$el.find('[name="height"]').val()).to.equal('123');
    });

    it('should save chart credits', function() {
        var view = new App.FormatEditor({model: new Backbone.Model()});
        view.$el.find('[name="credits-text"]').val('blah one').change();
        view.$el.find('[name="credits-link"]').val('blah two').change();
        var credits = view.model.get('credits');
        expect(credits['text']).to.equal('blah one');
        expect(credits['link']).to.equal('blah two');
    });

    it('should display existing chart height', function() {
        var view = new App.FormatEditor({model: new Backbone.Model({
            credits: {text: 'blah one', link: 'blah two'}
        })});
        expect(view.$el.find('[name="credits-text"]').val()
            ).to.equal('blah one');
        expect(view.$el.find('[name="credits-link"]').val()
            ).to.equal('blah two');
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

    it('should preselect defaults', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select', dimension: 'indicator'},
                     {name: 'dim2', type: 'select', dimension: 'breakdown'},
                     {name: 'dim3', type: 'select', dimension: 'unit-measure'},
                     {name: 'dim4', type: 'select', dimension: 'breakdown'},
                     {name: 'dim5', type: 'select', dimension: 'other'}]
        });
        var view = new App.AnnotationsEditor({model: model});
        var get_checkbox = function(name) {
            return view.$el.find('[name="annotation"][value="' + name + '"]');
        }
        expect(get_checkbox('dim1').is(':checked')).to.be.true;
        expect(get_checkbox('dim2').is(':checked')).to.be.true;
        expect(get_checkbox('dim3').is(':checked')).to.be.true;
        expect(get_checkbox('dim4').is(':checked')).to.be.true;
        expect(get_checkbox('dim5').is(':checked')).to.be.false;
    });

    it('should not preselect defaults', function() {
        var model = new Backbone.Model({
            facets: [{name: 'dim1', type: 'select', dimension: 'indicator'},
                     {name: 'dim2', type: 'select', dimension: 'breakdown'}],
            annotations: {filters: [{name: 'dim2'}]}
        });
        var view = new App.AnnotationsEditor({model: model});
        var get_checkbox = function(name) {
            return view.$el.find('[name="annotation"][value="' + name + '"]');
        }
        expect(get_checkbox('dim1').is(':checked')).to.be.false;
        expect(get_checkbox('dim2').is(':checked')).to.be.true;
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

    it('should save annotations texts', function() {
        var view = new App.AnnotationsEditor({model: new Backbone.Model()});
        view.$el.find('[name="title"]').val('blah one').change();
        view.$el.find('[name="notes"]').val('blah two').change();
        var annotations = view.model.get('annotations');
        expect(annotations['title']).to.equal('blah one');
        expect(annotations['notes']).to.equal('blah two');
    });

    it('should display existing annotations texts', function() {
        var view = new App.AnnotationsEditor({model: new Backbone.Model({
            annotations: {title: 'blah one', notes: 'blah two'}
        })});
        expect(view.$el.find('[name="title"]').val()).to.equal('blah one');
        expect(view.$el.find('[name="notes"]').val()).to.equal('blah two');
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
