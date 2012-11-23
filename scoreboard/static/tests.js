describe('FiltersView', function() {

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

});
