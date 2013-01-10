describe('Scenario3FiltersView', function() {
    "use strict";

    var choose = App.testing.choose_option;

    beforeEach(function() {
        this.filters_data = {'indicators': [{'uri': 'ind1'}, {'uri': 'ind2'}]};
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

});
