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


App.create_editor = function(form) {
    var configuration = new Backbone.Model();
    App.editor_form = new App.EditForm({
        model: configuration,
        el: form
    });
    $(form).append('hello editor!');
};


})(App.jQuery);
