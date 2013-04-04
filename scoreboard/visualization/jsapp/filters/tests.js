/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('modular filters', function() {
    "use strict";

    var url_param = App.testing.url_param;

    describe('SelectFilter', function() {

        beforeEach(function() {
            this.sandbox = sinon.sandbox.create();
        });

        var NoAjaxSelectFilter = App.SelectFilter.extend({
            fetch_options: function(args) {
                var mock_ajax = App.jQuery.Deferred();
                mock_ajax.abort = function() {
                    mock_ajax.reject();
                };
                return mock_ajax;
            }
        });

        it('should load options via ajax', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.SelectFilter({
                model: new Backbone.Model(),
                name: 'this-time-period',
                dimension: 'time-period'
            });
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            expect(view.dimension_options).to.deep.equal(options);
            expect(url_param(server.requests[0].url, 'dimension')).
                to.equal('time-period');
        });

        it('should filter years based on indicator', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.SelectFilter({
                model: new Backbone.Model({'this-indicator': 'i_iugm'}),
                constraints: {
                    'indicator': 'this-indicator'
                },
                name: 'this-time-period',
                dimension: 'time-period'
            });
            expect(url_param(server.requests[0].url, 'dimension')).
                to.equal('time-period');
            expect(url_param(server.requests[0].url, 'indicator')).
                to.equal('i_iugm');
        });

        it('should wait until all constraints are selected', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var model = new Backbone.Model();
            var c1 = new NoAjaxSelectFilter({model: model,
                                             name: 'this-indicator',
                                             dimension: 'indicator'});
            var c2 = new NoAjaxSelectFilter({model: model,
                                             name: 'this-ref-area',
                                             dimension: 'ref-area'});
            var view = new NoAjaxSelectFilter({
                model: model,
                constraints: {
                    'indicator': 'this-indicator',
                    'ref-area': 'this-ref-area'
                },
                name: 'this-time-period',
                dimension: 'time-period'
            });
            expect(view.ajax).to.equal(null);

            c1.ajax.resolve({options: [{notation: 'ind1'}]});
            expect(view.ajax).to.equal(null);

            c2.ajax.resolve({options: [{notation: 'country1'}]});
            expect(view.ajax).to.not.equal(null);
        });

        it('should wait until constraints finish loading', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var model = new Backbone.Model({'this-ref-area': 'country1'});
            var loadstate = new Backbone.Model();
            var c1 = new NoAjaxSelectFilter({model: model,
                                             loadstate: loadstate,
                                             name: 'this-ref-area',
                                             dimension: 'ref-area'});
            var view = new NoAjaxSelectFilter({
                model: model,
                loadstate: loadstate,
                constraints: {
                    'ref-area': 'this-ref-area'
                },
                name: 'this-time-period',
                dimension: 'time-period'
            });
            expect(view.ajax).to.equal(null);

            c1.ajax.resolve({options: [{notation: 'country1'}]});
            expect(view.ajax).to.not.equal(null);
        });

        it('should abort in-flight ajax requests', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.SelectFilter({
                model: new Backbone.Model(),
                name: 'this-time-period',
                dimension: 'time-period'
            });
            view.update();
            App.respond_json(server.requests[1], {
                'options': [{'label': "Option One", 'notation': 'two'}]});
            App.respond_json(server.requests[0], {
                'options': [{'label': "Option One", 'notation': 'one'}]});
            expect(view.dimension_options[0]['notation']).to.equal('two');
        });

        it('should update model with initial value', function() {
            var model = new Backbone.Model();
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            var view = new NoAjaxSelectFilter({
                model: model,
                name: 'this-time-period',
                dimension: 'time-period'
            });
            view.ajax.resolve({options: options});
            expect(model.get('this-time-period')).to.equal('one');
        });

        it('should update model when selection changes', function() {
            var model = new Backbone.Model();
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            var view = new NoAjaxSelectFilter({
                model: model,
                name: 'this-time-period',
                dimension: 'time-period'
            });
            view.ajax.resolve({options: options});
            App.testing.choose_option(view.$el.find('select'), 'two');
            expect(model.get('this-time-period')).to.equal('two');
        });

        it('should call dimension_values_xy view if xy is set', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.SelectFilter({
                xy: true,
                model: new Backbone.Model(),
                name: 'this-time-period',
                dimension: 'time-period'
            });
            expect(server.requests[0].url).to.contain('/dimension_values_xy?');
        });

        it('should render with current value selected', function() {
            var model = new Backbone.Model({'this-time-period': 'two'});
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            var view = new NoAjaxSelectFilter({
                model: model,
                name: 'this-time-period',
                dimension: 'time-period'
            });
            view.ajax.resolve({options: options});
            expect(view.$el.find('select').val()).to.equal('two');
            expect(model.get('this-time-period')).to.equal('two');
        });

        it('should pick default value if old value is invalid', function() {
            var model = new Backbone.Model({'this-time-period': 'other'});
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            var view = new NoAjaxSelectFilter({
                model: model,
                name: 'this-time-period',
                dimension: 'time-period',
                default_value: 'two'
            });
            view.ajax.resolve({options: options});
            expect(view.$el.find('select').val()).to.equal('two');
            expect(model.get('this-time-period')).to.equal('two');
        });

    });


    describe('MultipleSelectFilter', function() {

        var NoAjaxMultipleSelectFilter = App.MultipleSelectFilter.extend({
            fetch_options: function(args) {
                var mock_ajax = App.jQuery.Deferred();
                mock_ajax.abort = function() {
                    mock_ajax.reject();
                };
                return mock_ajax;
            }
        });

        it('should select all values if default_all', function() {
            var model = new Backbone.Model();
            var options = [{'notation': 'one'}, {'notation': 'two'}];
            var view = new NoAjaxMultipleSelectFilter({
                model: model,
                name: 'fil1',
                dimension: 'dim1',
                default_all: true
            });
            view.ajax.resolve({options: options});
            expect(view.$el.find('select').val()).to.deep.equal(['one', 'two']);
            expect(model.get('fil1')).to.deep.equal(['one', 'two']);
        });

        it('should preserve selection even if default_all', function() {
            var model = new Backbone.Model({'fil1': ['one']});
            var options = [{'notation': 'one'}, {'notation': 'two'}];
            var view = new NoAjaxMultipleSelectFilter({
                model: model,
                name: 'fil1',
                dimension: 'dim1',
                default_all: true
            });
            view.ajax.resolve({options: options});
            expect(view.$el.find('select').val()).to.deep.equal(['one']);
            expect(model.get('fil1')).to.deep.equal(['one']);
        });

        it('should pick default value if old value is invalid', function() {
            var model = new Backbone.Model({'fil1': 'other'});
            var options = [{'label': "Option One", 'notation': 'v1'},
                           {'label': "Option Two", 'notation': 'v2'},
                           {'label': "Option Three", 'notation': 'v3'}];
            var view = new NoAjaxMultipleSelectFilter({
                model: model,
                name: 'fil1',
                dimension: 'dim1',
                default_value: ['v2', 'v3']
            });
            view.ajax.resolve({options: options});
            expect(view.$el.find('select').val()).to.deep.equal(['v2', 'v3']);
            expect(model.get('fil1')).to.deep.equal(['v2', 'v3']);
        });

    });

    describe('FilterPositioning', function() {
        "use strict";

        beforeEach(function() {
            this.sandbox = sinon.sandbox.create();
            this.sandbox.useFakeServer();
            this.model = new Backbone.Model();

            this.schema = {
                filters: [
                    {type: 'select',
                     position: '.left_column',
                     name: 'indicator-group',
                     label: 'Indicator group',
                     dimension: 'indicator-group',
                     constraints: {}},
                    {type: 'select',
                     position: '.right_column',
                     name: 'indicator',
                     label: 'Indicator',
                     dimension: 'indicator',
                     constraints: {
                         'indicator-group': 'indicator-group'
                     }}
                ]
            };
        });

        afterEach(function () {
            this.sandbox.restore();
        });

        it('should append filters on the left if pos param is missing', function(){
            var schema = {
                filters: [
                    {type: 'select',
                     name: 'indicator-group',
                     label: 'Indicator group',
                     dimension: 'indicator-group',
                     constraints: {}}
                ]
            };

            var box = $('<div></div>');
            box.html(App.get_template('scenario.html')());

            var filter_loadstate = new Backbone.Model();

            var filters_box = new App.FiltersBox({
                el: $('#the-filters', box)[0],
                model: this.model,
                loadstate: App.filter_loadstate,
                schema: schema
            });
            expect($('.left_column', filters_box.$el).children().length).to.equal(1);
        });

        it('should position filters according to configuration', function(){

            var box = $('<div></div>');
            box.html(App.get_template('scenario.html')());

            var filter_loadstate = new Backbone.Model();

            var filters_box = new App.FiltersBox({
                el: $('#the-filters', box)[0],
                model: this.model,
                loadstate: App.filter_loadstate,
                schema: this.schema
            });
            expect($('.left_column', filters_box.$el).children().length).to.equal(1);
            expect($('.right_column', filters_box.$el).children().length).to.equal(1);
        });

    });

});
