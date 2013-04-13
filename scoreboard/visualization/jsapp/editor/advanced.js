/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.AdvancedEditor = Backbone.View.extend({

    title: "Advanced",

    template: App.get_template('editor/advanced.html'),

    events: {
        'click button': 'on_click_save'
    },

    initialize: function(options) {
        this.render();
    },

    render: function() {
        var value = JSON.stringify(this.model.toJSON(), null, 2);
        this.$el.html(this.template({value: value}));
    },

    on_click_save: function(evt) {
        evt.preventDefault();
        var value = JSON.parse(this.$el.find('textarea').val());
        this.model.clear();
        this.model.set(value);
        this.trigger('save');
    }

});


})(App.jQuery);
