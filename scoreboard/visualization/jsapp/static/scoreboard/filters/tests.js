/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('modular filters', function() {
    "use strict";

    var url_param = App.testing.url_param;

    describe('IndicatorFilter', function() {

        beforeEach(function() {
            this.sandbox = sinon.sandbox.create();
        });

        it('should load options via ajax', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.IndicatorFilter();
            var options = [{'label': "Option One", 'notation': 'one'},
                           {'label': "Option Two", 'notation': 'two'}];
            App.respond_json(server.requests[0], {'options': options});
            expect(view.dimension_options).to.deep.equal(options);
            expect(url_param(server.requests[0].url, 'dimension')).
                to.equal('indicator');
        });

    });


    describe('YearFilter', function() {

        beforeEach(function() {
            this.sandbox = sinon.sandbox.create();
        });

        it('should load options via ajax', function() {
            this.sandbox.useFakeServer();
            var server = this.sandbox.server;
            var view = new App.YearFilter({model: new Backbone.Model()});
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
            var view = new App.YearFilter({
                model: new Backbone.Model({'indicator': 'i_iugm'})
            });
            expect(url_param(server.requests[0].url, 'dimension')).
                to.equal('time-period');
            expect(url_param(server.requests[0].url, 'indicator')).
                to.equal('i_iugm');
        });

    });

});
