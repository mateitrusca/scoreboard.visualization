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
        });

    });

    describe('RadioFilter', function() {
        beforeEach(function() {
            this.sandbox = sinon.sandbox.create();
        });

        var NoAjaxSelectFilter = App.RadioFilter.extend({
            fetch_options: function(args) {
                var mock_ajax = App.jQuery.Deferred();
                mock_ajax.abort = function() {
                    mock_ajax.reject();
                };
                return mock_ajax;
            }
        });

        it('should update model when selection changes', function() {
            var model = new Backbone.Model();
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            var view = new NoAjaxSelectFilter({
                model: model,
                name: 'this-breakdown',
                dimension: 'breakdown'
            });
            view.ajax.resolve({options: options});
            App.testing.choose_radio(view.$el.find('input:radio'), 'two');
            expect(model.get('this-breakdown')).to.equal('two');
        });
    });


});
