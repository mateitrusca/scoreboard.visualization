describe('FiltersView', function() {
    "use strict";

    describe('indicators selector', function() {

        it('should update model', function() {
            var model = new Backbone.Model;
            var filters_data = {
                indicators: [
                    {label: "Telecom sector",
                     options: [ {value: "one", label: ""} ]}
                ]
            };
            var view = new App.FiltersView({
                model: model,
                filters_data: filters_data
            });
            var opt = view.$el.find('select option[value=one]');
            opt.attr('selected', 'selected').change();
            expect(model.get('indicator')).to.equal('one');
        });

    });

    describe('year radio buttons', function() {

        it('should update model', function() {
            var model = new Backbone.Model;
            var filters_data = {
                years: [
                    {value: "2009"},
                    {value: "2010"}
                ]
            };
            var view = new App.FiltersView({
                model: model,
                filters_data: filters_data
            });
            var year = view.$el.find('input[value=2010]');
            year.attr('checked', 'checked').change();
            expect(model.get('year')).to.equal('2010');
        });

    });

});
