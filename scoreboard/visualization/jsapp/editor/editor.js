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
        this.model.on('change', this.update_form, this);
        this.$el.append(this.template());
    },

    update_form: function() {
        var value = this.model.get_value();
        var sorted = copyObjectWithSortedKeys(value);
        console.log(sorted);
        console.log(JSON.stringify(sorted));
        this.input.val(JSON.stringify(sorted, null, 2));  // indent 2 spaces
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
        'StructureEditor',
        'LayoutEditor',
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
            var step = new Cls({model: this.model});
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
        this.step.render();
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


App.EditorConfiguration = Backbone.Model.extend({

    initialize: function(models, options) {
        this.dimensions = options['dimensions'];
        this.facets = new App.FacetCollection(this.get('facets'),
                                              this.dimensions);
        this.facets.on('change sort', this.save_facets, this);
    },

    save_facets: function() {
        this.set('facets', this.facets.get_value(this.get('multidim')));
    },

    get_value: function() {
        var value = this.toJSON();
        return value;
    }

});


App.create_editor = function(form, object_url) {
    var initial_value = JSON.parse($(form).find('[name=configuration]').val());
    App.editor_configuration = new App.EditorConfiguration(initial_value, {
        dimensions: App.CUBE_DIMENSIONS
    });

    App.editor_form = new App.EditForm({
        model: App.editor_configuration,
        el: form,
        object_url: object_url
    });

    var create_editor_view = function() {
        App.editor = new App.Editor({
            model: App.editor_configuration
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
