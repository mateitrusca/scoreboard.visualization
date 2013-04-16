/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.EditForm = Backbone.View.extend({

    template: App.get_template('editor/editor_form.html'),

    events: {
       'click button[type="submit"]': 'on_submit',
       'click button[type="button"]': 'on_cancel'
    },

    initialize: function(options) {
        this.input = this.$el.find('input[name=configuration]');
        this.model.set(JSON.parse(this.input.val()));
        this.model.on('change', this.update_form, this);
        this.$el.append(this.template());
    },

    update_form: function() {
        this.input.val(JSON.stringify(this.model, null, 2));  // indent 2 spaces
    },

    on_submit: function(evt) {
        evt.preventDefault();
        this.save_form();
    },

    on_cancel: function(evt) {
        evt.preventDefault();
        App.window.location.href = this.options['object_url'];
    },

    save_form: function() {
        var form_status = this.$el.find('.editor-form-status');
        form_status.text('saving...');
        var data = {'configuration': this.input.val()};
        $.post(this.$el.attr('action'), data, function() {
            form_status.text('ok');
        });
    }

});


App.Editor = Backbone.View.extend({

    className: 'editor-box',

    template: App.get_template('editor/editor.html'),

    events: {
        'click .editor-steps a': 'on_click_step'
    },

    step_cls: [
        'ChartTypeEditor',
        'FacetsEditor',
        'AxesEditor',
        'SeriesEditor',
        'FormatEditor',
        'AnnotationsEditor',
        'AdvancedEditor'
    ],

    initialize: function(options) {
        this.step_views = {};
        this.all_steps = _(this.step_cls).map(function(name) {
            var Cls = App[name];
            var step = new Cls({
                model: this.model,
                cube_url: options['cube_url']
            });
            this.step_views[name] = step;
            step.$el.addClass('editor-current-step');
            return step;
        }, this);
        this.step = this.all_steps[0];
        this.render();
        this.step_views['AdvancedEditor'].on('save', function() {
            this.trigger('advanced_save');
        }, this);
    },

    render: function() {
        var all_steps = _(this.all_steps).map(function(step) {
            return {
                'cid': step.cid,
                'title': step.title,
                'current': (this.step == step)
            };
        }, this);
        this.$el.html(this.template({
            step: this.step,
            all_steps: all_steps
        }));
        this.$el.append(this.step.el);
        this.step.delegateEvents();
    },

    on_click_step: function(evt) {
        evt.preventDefault();
        var step_cid = $(evt.target).data('step-cid');
        this.step = _(this.all_steps).where({cid: step_cid})[0];
        this.render();
    }

});


App.create_editor = function(form, object_url) {
    var configuration = new Backbone.Model();
    App.editor_form = new App.EditForm({
        model: configuration,
        el: form,
        object_url: object_url
    });

    var create_editor_view = function() {
        App.editor = new App.Editor({
            model: configuration,
            cube_url: App.URL
        });
        App.editor.$el.insertBefore(form);

        App.editor.on('advanced_save', function() {
            App.editor_form.save_form();
            App.editor.remove();
            create_editor_view();
        });
    };
    create_editor_view();
};


})(App.jQuery);
