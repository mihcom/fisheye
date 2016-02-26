define(['fabric', 'lodash', 'jquery'], function (fabric, _, $) {
    'use strict';

    var Fisheye = function (options) {
        if (!_.isPlainObject(options)) {
            throw new Error('Please provide options (plain object)');
        }

        if (!_.isElement(options.canvas)) {
            throw new Error('Please specify canvas');
        }

        if (_.isEmpty(options.imageUrl)) {
            throw new Error('Please specify image url');
        }

        this.options = options;

        this.canvas = new fabric.StaticCanvas(options.canvas, {width: $('body').width(), height: 600});
        this.loadImage();

        return {};
    };

    Fisheye.prototype.loadImage = function () {
        fabric.Image.fromURL(this.options.imageUrl, function (image) {
            this.canvas.add(image);
        }.bind(this));

        $(window).resize(function () {
            var windowWidth = $('body').width();

            this.canvas.setWidth(windowWidth);
            this.canvas.calcOffset();
        }.bind(this));
    };

    return Fisheye;
});