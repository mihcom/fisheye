define(['app', 'underscore', 'text!./template.html'], function (App, _, template) {
    'use strict';

    App.module('AnnotatedFisheye', function (AnnotatedFisheye, App, Backbone, Marionette) {
        AnnotatedFisheye.AnnotationView = Marionette.ItemView.extend({
            template: _.template(template),
            tagName: 'li',

            setVisualRange: function (visualRange) {
                this.$el.css({
                    left: visualRange.lower,
                    width: visualRange.upper - visualRange.lower
                });
            }
        });
    });

    /** @namespace App.AnnotatedFisheye */
    return App.AnnotatedFisheye.AnnotationView;
});