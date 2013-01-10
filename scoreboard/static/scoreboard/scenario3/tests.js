describe('Scenario3FiltersView', function() {
    "use strict";

    var choose = App.testing.choose_option;

    beforeEach(function() {
        this.filters_data = {'indicators': [
            {'uri': 'ind1', 'years': ["2009", "2010"]},
            {'uri': 'ind2', 'years': ["2010", "2011", "2012"]},
            {'uri': 'ind3', 'years': ["2011", "2012"]}
        ]};
        this.model = new Backbone.Model();
        this.view = new App.Scenario3FiltersView({
            model: this.model,
            filters_data: this.filters_data
        });
    });

    describe('indicators selector', function() {

        it('should select x axis', function() {
            choose(this.view.$el.find('select[name=indicator_x]'), 'ind2');
            expect(this.model.get('indicator_x')).to.equal('ind2');
        });

        it('should select y axis', function() {
            choose(this.view.$el.find('select[name=indicator_y]'), 'ind2');
            expect(this.model.get('indicator_y')).to.equal('ind2');
        });

    });

    describe('year radio buttons', function() {

        var year_options = function(view) {
            return view.$el.find('[name=year]').map(function() {
                return $(this).attr('value');
            }).get();
        };

        it('should display nothing for ind1/ind3', function() {
            this.model.set({'indicator_x': 'ind1', 'indicator_y': 'ind3'});
            expect(year_options(this.view)).to.deep.equal([]);
        });

    });

});
