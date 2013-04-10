/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.EditForm = Backbone.View.extend({

    initialize: function(options) {
        this.input = this.$el.find('input[name=configuration]');
        this.model.set(JSON.parse(this.input.val()));
        this.model.on('change', this.save, this);
    },

    save: function() {
        this.input.val(JSON.stringify(this.model, null, 2));  // indent 2 spaces
    }

});


App.Editor = Backbone.View.extend({

    className: 'editor-box',

    template: App.get_template('editor/editor.html'),

    events: {
        'change': 'save'
    },

    steps: [
        {label: "Chart Type"},
        {label: "Filters"},
        {label: "Axes"},
        {label: "Series"},
        {label: "Format"},
        {label: "Annotations"}
    ],

    chart_types: [
        {label: "Bar", disabled: true},
        {label: "Line", value: 'lines'},
        {label: "Column", value: 'columns'},
        {label: "Scatterplot", value: 'scatter'},
        {label: "Map", value: 'map'},
        {label: "Country Profile", disabled: true}
    ],

    initialize: function(options) {
        this.$el.html(this.template({
            steps: this.steps,
            chart_types: this.chart_types
        }));
    },

    save: function() {
        this.model.set({
            chart_type: this.$el.find('[name=chart-type]:checked').val()
        });
    }

});


App.create_editor = function(form) {
    var configuration = new Backbone.Model();
    App.editor_form = new App.EditForm({
        model: configuration,
        el: form
    });
    App.editor = new App.Editor({model: configuration});
    App.editor.$el.insertBefore(form);
};


})(App.jQuery);
