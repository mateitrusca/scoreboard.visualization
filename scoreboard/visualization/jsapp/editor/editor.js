/*global App, Backbone */
/*jshint sub:true */

(function($) {
"use strict";


App.EditForm = Backbone.View.extend({

    initialize: function(options) {
        this.model.set(JSON.parse(this.$el.val()));
        this.model.on('change', this.save, this);
    },

    save: function() {
        this.$el.val(JSON.stringify(this.model, null, 2));  // indent 2 spaces
    }

});


App.create_editor = function(form) {
    var configuration = new Backbone.Model();
    App.editor_form = new App.EditForm({
        model: configuration,
        el: $(form).find('input[name=configuration]')[0]
    });
    $(form).append('hello editor!');
};


})(App.jQuery);
