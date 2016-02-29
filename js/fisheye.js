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

        this.loadImages();

        return {};
    };

    Fisheye.prototype.loadImages = function () {
        var ready = new $.Deferred();

        this.canvas = new fabric.StaticCanvas(this.options.canvas, {
            width: $('body').width(),
            height: 600,
            renderOnAddRemove: false
        });

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
                    width: imageWidth,
                    height: imageHeight,
                    left: i * imageWidth,
                    index: i,
                });

                spriteElement.clipTo = this.applyFishEyeToImage.bind(this, spriteElement);

                this.images.push(spriteElement);
                this.canvas.add(spriteElement);
            }

            var onResize = function (){
                var windowWidth = $('body').width();
                this.canvas.setWidth(windowWidth);
                this.canvas.renderAll();
            }.bind(this);

            onResize();

            $(window).resize(_.throttle(onResize, 300));

            ready.resolve();
        }.bind(this));

        return ready.promise();
    };

    Fisheye.prototype.applyFishEyeToImage = function (image, context) {
        var width = this.getWidth(image);
        window.console.log(width);

        if (image.index == 0) {
            this.positionAccumulator = 0;
        }

        image.set({
            left: this.positionAccumulator - image.width / 2 + width / 2
        });

        this.positionAccumulator += width;

        context.save();

        context.translate(-width / 2, -image.height / 2);

        context.rect(0, 0, width, 225);

        context.restore();

        //window.console.log(arguments);
    };

    Fisheye.prototype.getWidth = function (image) {
        return this.canvas.width / this.options.spriteImagesCount;
    };

    return Fisheye;
});