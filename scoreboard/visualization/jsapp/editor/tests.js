/*global App, Backbone, describe, beforeEach, afterEach, it, expect, sinon */
/*jshint sub:true */

describe('ChartTypeEditor', function() {
    "use strict";

    var testing = App.testing;

    it('should select chart type', function() {
        var model = new Backbone.Model();
        var editor = new App.ChartTypeEditor({model: model});
        testing.choose_radio(editor.$el.find('[name=chart-type]'), 'columns');
        expect(model.get('chart_type')).to.equal('columns');
    });

});
