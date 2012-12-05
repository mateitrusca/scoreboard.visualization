describe('FiltersView', function() {
    "use strict";

    describe('indicators selector', function() {

        it('should update model', function() {
            var model = new Backbone.Model;
            var filters_data = {'indicators': [{'uri': "one"}]};
            var view = new App.FiltersView({
                model: model,
                filters_data: filters_data
            });
            var opt = view.$el.find('select option[value=one]');
            opt.attr('selected', 'selected').change();
            expect(model.get('indicator')).to.equal('one');
        });

        it('should select the current indicator', function() {
            var filters_data = {'indicators': [{'uri': "one"}, {'uri': "two"}]};
            var view = new App.FiltersView({
                model: new Backbone.Model({'indicator': 'two'}),
                filters_data: filters_data
            });
            var option_two = view.$el.find('option[value=two]');
            expect(option_two.attr('selected')).to.equal('selected');
        });

    });

    describe('year radio buttons', function() {

        it('should update model', function() {
            var model = new Backbone.Model({'indicator': 'i'});
            var filters_data = {'indicators': [
                {'uri': 'i', 'years': ["2009", "2010"]}
            ]};
            var view = new App.FiltersView({
                model: model,
                filters_data: filters_data
            });
            var year = view.$el.find('input[value=2010]');
            year.attr('checked', 'checked').change();
            expect(model.get('year')).to.equal('2010');
        });

        it('should select the current year', function() {
            var filters_data = {'indicators': [
                {'uri': 'i', 'years': ["2009", "2010"]}
            ]};
            var view = new App.FiltersView({
                model: new Backbone.Model({'indicator': 'i', 'year': '2010'}),
                filters_data: filters_data
            });
            var year_two = view.$el.find('input[name=year][value=2010]');
            expect(year_two.attr('checked')).to.equal('checked');
        });

        it('should update list of years when indicator changes', function() {
            var filters_data = {'indicators': [
                {'uri': 'ind1', 'years': ["2009", "2010"]},
                {'uri': 'ind2', 'years': ["2010", "2011"]},
            ]};
            var model = new Backbone.Model({
                'indicator': 'ind1',
                'year': '2010'
            });
            var view = new App.FiltersView({
                model: model,
                filters_data: filters_data
            });
            model.set({'indicator': 'ind2'});

            var years = view.$el.find('input[name=year]').map(function() {
                return $(this).val();
            }).get();
            expect(years).to.deep.equal(['2010', '2011']);
        });

    });

});


var url_param = function(url, name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) { return null; }
    return decodeURIComponent(results[1]);
}


describe('ChartView', function() {
    "use strict";

    var server, render_highcharts;

    beforeEach(function() {
        server = sinon.fakeServer.create();
        render_highcharts = sinon.stub(App, 'render_highcharts');
    });

    afterEach(function () {
        server.restore();
        render_highcharts.restore();
    });

    it('should fetch data from server', function() {
        var model = new Backbone.Model;
        var chart = new App.ChartView({model: model});
        model.set({
            'indicator': 'asdf',
            'year': '2002'
        });

        expect(server.requests.length).to.equal(1);
        var url = server.requests[0].url;
        expect(url).to.have.string(App.URL + '/data?')
        expect(url_param(url, 'method')).to.equal('get_one_indicator_year');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'year')).to.equal(
            'http://data.lod2.eu/scoreboard/year/2002');
    });

    it('should render chart with the data received', function() {
        var model = new Backbone.Model;
        var chart = new App.ChartView({model: model});
        model.set({
            'indicator': 'asdf',
            'year': '2002'
        });

        var ajax_data = [{'country_name': "Austria", 'value': 0.18},
                         {'country_name': "Belgium", 'value': 0.14}];
        server.requests[0].respond(
            200, {'Content-Type': 'application/json'},
            JSON.stringify(ajax_data));

        var container = chart.$el.find('.highcharts-chart')[0];
        expect(render_highcharts.calledOnce).to.equal(true);
        var call_args = render_highcharts.getCall(0).args;
        expect(call_args[0]).to.equal(container);
        expect(call_args[1]).to.deep.equal(ajax_data);
    });

});


describe('MetadataView', function() {
    "use strict";

    var server;

    beforeEach(function() {
        server = sinon.fakeServer.create();
    });

    afterEach(function () {
        server.restore();
    });

    it('should display data from server', function() {
        var view = new App.MetadataView({
            model: new Backbone.Model({'indicator': 'asdf', 'year': '2002'})
        });

        expect(server.requests.length).to.equal(1);
        var url = server.requests[0].url;
        expect(url_param(url, 'method')).to.equal('get_indicator_meta');
        expect(url_param(url, 'indicator')).to.equal('asdf');
        expect(url_param(url, 'year')).to.equal(
            'http://data.lod2.eu/scoreboard/year/2002');

        var ajax_data = [{
            'label': "The Label!",
            'comment': "The Definition!",
            'publisher': "The Source!"
        }];
        server.requests[0].respond(200, {'Content-Type': 'application/json'},
                                   JSON.stringify(ajax_data));

        expect(view.$el.find('h3').text()).to.equal("The Label!");
        expect(view.$el.find('li:first').text()).to.contain.string(
            "The Definition!");
        expect(view.$el.find('li:last').text()).to.contain.string(
            "The Source!");
    });

});
