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
                model: new Backbone.Model({'indicator': 'i_iugm'}),
                constraints: ['indicator'],
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
            var view = new App.SelectFilter({
                model: new Backbone.Model({'indicator': 'i_iugm'}),
                constraints: ['indicator', 'ref-area'],
                dimension: 'time-period'
            });
            expect(server.requests).to.deep.equal([]);
        });

        it('should abort in-flight ajax requests', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.SelectFilter({
                model: new Backbone.Model(),
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
                dimension: 'time-period'
            });
            view.ajax.resolve({options: options});
            expect(model.get('time-period')).to.equal('one');
        });

        it('should update model when selection changes', function() {
            var model = new Backbone.Model();
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            var view = new NoAjaxSelectFilter({
                model: model,
                dimension: 'time-period'
            });
            view.ajax.resolve({options: options});
            App.testing.choose_option(view.$el.find('select'), 'two');
            expect(model.get('time-period')).to.equal('two');
        });

    });

});
