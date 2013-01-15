/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */

describe('IndicatorMetadataView', function() {
    "use strict";

    it('should display data from indicators', function() {
        var view = new App.IndicatorMetadataView({
            model: new Backbone.Model({
                'indicator': 'asdf'
            }),
            field: 'indicator',
            indicators: {
                'asdf': {
                    'label': "The Label!",
                    'comment': "The Definition!",
                    'publisher': "The Source!"
                }
            }
        });

        expect(view.$el.find('h3').text()).to.equal("The Label!");
        expect(view.$el.find('li:first').text()).to.contain.string(
            "The Definition!");
        expect(view.$el.find('li:last').text()).to.contain.string(
            "The Source!");
    });

});
