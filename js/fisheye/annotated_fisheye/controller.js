define(['underscore', 'jquery', 'app', './view'], function (_, $, App, View) {
    'use strict';

    App.module('AnnotatedFisheye', function (AnnotatedFisheye, App, Backbone, Marionette) {

        AnnotatedFisheye.Controller = Marionette.Object.extend({
            initialize: function (options) {
                var model = this.getModel(options),
                    view = this.getView(model);

                this.show(options.el, view);
            },

            getModel: function (options) {
                return new Backbone.Model(_.omit(options, 'el'));
            },

            getView: function (model) {
                this.view = new View({model: model});
                return this.view;
            },

            show: function (root, view) {
                view.render();
                $(root).html(view.el);
            }
        });
    });

    return App.AnnotatedFisheye.Controller;
});