define(['app', 'underscore', 'jquery', 'text!./template.html', './annotation_view/view', 'fisheye.canvas'],
    function (App, _, $, template, AnnotationView, Fisheye) {
        'use strict';

        App.module('AnnotatedFisheye', function (AnnotatedFisheye, App, Backbone, Marionette) {
            AnnotatedFisheye.View = Marionette.CompositeView.extend({
                template: _.template(template),
                childView: AnnotationView,
                childViewContainer: '@ui.annotationsContainer',
                className: 'annotated-fisheye',

                ui: {
                    annotationsContainer: 'ul'
                },

                initialize: function () {
                    this.collection = this.getCollection();
                },

                getCollection: function () {
                    var annotations = this.model.get('annotations') || {},
                        models = _.map(annotations, function (value, key) {
                            var rangeBounds = key.split('-'),
                                range = {
                                    lower: parseInt(rangeBounds[0], 10),
                                    upper: rangeBounds.length > 1 ? parseInt(rangeBounds[1], 10) : parseInt(rangeBounds[0], 10)
                                };

                            return new Backbone.Model({
                                range: range,
                                annotation: value
                            });
                        });

                    return new Backbone.Collection(models);
                },

                onRender: function () {
                    this.applyFishEye();
                },

                applyFishEye: function () {
                    var options = this.model.toJSON();
                    options.canvas = this.$('canvas')[0];

                    this.fishEye = new Fisheye(options);

                    $.when(this.fishEye.ready()).then(function () {
                        this.listenTo(this.fishEye, 'change', this.positionAnnotations);
                        this.listenTo(this.fishEye, 'click', this.trigger.bind(this, 'image:clicked'));
                        this.positionAnnotations();
                    }.bind(this));
                },

                positionAnnotations: function () {
                    this.children.each(function (childView) {
                        var range = childView.model.get('range'),
                            visualRange = this.fishEye.getVisualRange(range);

                        childView.setVisualRange(visualRange);
                    }.bind(this));

                    _.defer(function () {
                        var heights = this.children.map(function (childView) {
                                return childView.$el.outerHeight();
                            }),
                            maxHeight = _.max(heights);

                        this.ui.annotationsContainer.height(maxHeight + 10);
                    }.bind(this));
                }
            });
        });

        /** @namespace App.AnnotatedFisheye */
        return App.AnnotatedFisheye.View;
    });