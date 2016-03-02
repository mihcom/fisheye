define(['fabric', 'lodash', 'jquery', 'helpers/requestAnimationFrame'], function (fabric, _, $) {
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

        this.loadImages();

        return {};
    };

    Fisheye.prototype.loadImages = function () {
        var ready = new $.Deferred(),
            canvas = new fabric.Canvas(this.options.canvas, {
                width: $('body').width(),
                height: 600,
                renderOnAddRemove: false
            });

        this.canvas = canvas;
        this.images = [];

        fabric.Image.fromURL(this.options.imageUrl, function (spriteImage) {
            var tempCanvas = new fabric.StaticCanvas(),
                imageWidth = spriteImage.width / this.options.spriteImagesCount,
                imageHeight = spriteImage.height;

            tempCanvas.setDimensions({
                width: imageWidth,
                height: imageHeight
            });

            spriteImage.originX = 'left';
            spriteImage.originY = 'top';

            tempCanvas.add(spriteImage);

            for (var i = 0; i < this.options.spriteImagesCount; i++) {
                spriteImage.left = -imageWidth * i;
                spriteImage.setCoords();
                tempCanvas.renderAll();

                var image = new window.Image();
                image.src = tempCanvas.toDataURL();

                var spriteElement = new fabric.Image(image, {
                    selectable: false,
                    width: imageWidth,
                    height: imageHeight,
                    left: i * imageWidth,
                    visualWidth: imageWidth,
                    visualRange: {},
                    index: i
                });

                spriteElement.clipTo = this.applyFishEyeToImage.bind(this, spriteElement);

                this.images.push(spriteElement);
                this.canvas.add(spriteElement);
            }

            this.updateFishEye();

            var onResize = function () {
                var windowWidth = $('body').width();
                this.canvas.setWidth(windowWidth);
                this.updateFishEye();
            }.bind(this);

            onResize();

            $(window).resize(_.throttle(onResize, 300));

            this.canvas.on('mouse:move', function (options) {
                var target = options.target;

                if (target) {
                    var pointer = canvas.getPointer(options.e);

                    if (pointer.x <= target.visualRange.left) {
                        target = this.images[target.index - 1];
                    }
                }

                this.updateFishEye({image: target});
            }.bind(this));

            var updateCanvas = function () {
                canvas.renderAll();
                window.requestAnimationFrame(updateCanvas);
            }

            window.requestAnimationFrame(updateCanvas);

            ready.resolve();
        }.bind(this));

        return ready.promise();
    };

    Fisheye.prototype.applyFishEyeToImage = function (image, context) {
        context.save();

        context.translate(-image.visualWidth / 2, -image.height / 2);

        context.rect(0, 0, image.visualWidth, 225);

        context.restore();
    };

    Fisheye.prototype.updateFishEye = function (options) {
        options = options || {};

        var images = this.images;

        var newVisualWidth = this.canvas.width / this.options.spriteImagesCount,
            totalWidth = this.images.length * newVisualWidth,
            length = this.images.length;

        this.positionAccumulator = 0;

        for (var i = 0, length = this.images.length; i < length; i++) {
            images[i].newVisualWidth = newVisualWidth;
        }

        if (options.image) {
            totalWidth += options.image.width - options.image.newVisualWidth;
            options.image.newVisualWidth = options.image.width;

            var WAVE_LENGTH = 3,
                WAVE_FORCE = 0.8;

            for (i = options.image.index - 1; i >= 0 && i >= options.image.index - WAVE_LENGTH; i--) {
                this.images[i].newVisualWidth = this.images[i + 1].newVisualWidth * WAVE_FORCE;
            }

            for (i = options.image.index + 1; i < length && i < options.image.index + WAVE_LENGTH; i++) {
                this.images[i].newVisualWidth = this.images[i - 1].newVisualWidth * WAVE_FORCE;
            }
        }

        if (totalWidth > this.canvas.width) {
            var scaleFactor = this.canvas.width / totalWidth;

            for (i = 0; i < length; i++) {
                this.images[i].newVisualWidth *= scaleFactor;
            }
        }

        for (i = 0; i < length; i++) {
            var image = this.images[i];

            //image.animate({
            //    left: this.positionAccumulator + (image.newVisualWidth - image.width ) / 2,
            //    visualWidth: image.newVisualWidth
            //}, {
            //    duration: 10,
            //    easing: fabric.util.ease.easeOutExpo
            //});

            image.set({
                left: this.positionAccumulator + (image.newVisualWidth - image.width ) / 2,
                visualWidth: image.newVisualWidth
            });

            image.visualRange.left = image.left + +(image.width - image.newVisualWidth) / 2;

            image.setCoords();

            this.positionAccumulator += image.newVisualWidth;
        }
    };

    return Fisheye;
});