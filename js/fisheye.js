define(['fabric', 'lodash', 'jquery', 'stats', 'helpers/requestAnimationFrame'], function (fabric, _, $, Stats) {
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

        $.when(this.loadImages()).then(this.outputPerformanceStats.bind(this));

        return {};
    };

    Fisheye.prototype.loadImagesFromSprite = function () {
        var deferred = new $.Deferred(),
            images = [];

        fabric.Image.fromURL(this.options.imageUrl, function (spriteImage) {
            var tempCanvas = new fabric.StaticCanvas(),
                imageWidth = spriteImage.width / this.options.spriteImagesCount,
                imageHeight = spriteImage.height;

            tempCanvas.setDimensions({
                width: imageWidth,
                height: imageHeight
            });

            tempCanvas.add(spriteImage);

            for (var i = 0; i < this.options.spriteImagesCount; i++) {
                spriteImage.left = -imageWidth * i;
                tempCanvas.renderAll();

                var image = new window.Image();
                image.src = tempCanvas.toDataURL();

                var spriteElement = new fabric.Image(image, {
                    width: imageWidth,
                    height: imageHeight,
                    left: i * imageWidth
                });

                spriteElement.clipTo = this.applyFishEyeToImage.bind(this, spriteElement);

                images.push(spriteElement);
            }

            deferred.resolve(images);
        }.bind(this));

        return deferred.promise();
    };

    Fisheye.prototype.loadImagesFromSet = function () {
        var deferred = new $.Deferred(),
            images = [],
            promises = _.map(this.options.imageUrl, function (url, index) {
                var imageDeferred = new $.Deferred();

                fabric.Image.fromURL(url, function (image) {
                    images[index] = image;
                    imageDeferred.resolve();
                });

                return imageDeferred.promise();
            });

        $.when.apply($, promises).then(deferred.resolve.bind(deferred, images));

        return deferred.promise();
    };

    Fisheye.prototype.loadImages = function () {
        var ready = new $.Deferred(),
            canvas = new fabric.Canvas(this.options.canvas, {
                renderOnAddRemove: false,
                controlsAboveOverlay: false,
                stateful: false,
                selection: false
            }),
            imageLoad = _.isString(this.options.imageUrl) ? this.loadImagesFromSprite() : this.loadImagesFromSet();

        this.canvas = canvas;

        $.when(imageLoad).then(function (images) {
            this.images = images;

            _.each(this.images, function (image, index) {
                image.set({
                    selectable: false,
                    left: index * image.width,
                    visualWidth: image.width,
                    clipTo: this.applyFishEyeToImage.bind(this, image)
                });

                this.canvas.add(image);
            }.bind(this));

            this.canvas.setDimensions({
                width: $(this.options.canvas).width(),
                height: this.images[0].height
            });

            this.updateFishEye();

            var onResize = function () {
                var canvasWidth = $(this.options.canvas).parent().parent().width();
                this.canvas.setWidth(canvasWidth);
                this.updateFishEye();
            }.bind(this);

            onResize();

            $(window).resize(_.throttle(onResize, 300));

            this.canvas.on('mouse:move', function (options) {
                var pointer = options.target ? canvas.getPointer(options.e) : undefined;
                this.updateFishEye({pointer: pointer});
            }.bind(this));

            $(this.options.canvas).parent().mouseout(this.updateFishEye.bind(this));

            var updateCanvas = function () {
                this.stats.begin();

                canvas.renderAll();
                this.renderImagesSeparator();

                window.requestAnimationFrame(updateCanvas);

                this.stats.end();
            }.bind(this);

            window.requestAnimationFrame(updateCanvas);

            ready.resolve();
        }.bind(this));

        return ready.promise();
    };

    Fisheye.prototype.applyFishEyeToImage = function (image, context) {
        context.save();
        context.translate(-image.visualWidth / 2, -image.height / 2);
        context.rect(0, 0, image.visualWidth, image.height);
        context.restore();
    };

    Fisheye.prototype.updateFishEye = function (options) {
        options = options || {};

        if (!options.pointer) {
            delete this.pointer;
        }
        else {
            if (!this.pointer) {
                this.pointer = options.pointer;
            }
            else {
                //new createjs.Tween(this.pointer, {
                //    override: true,
                //    onChange: this.updateFishEye.bind(this)
                //}).to({
                //    x: options.pointer.x
                //}, 400, createjs.Ease.circOut);
                this.pointer = options.pointer;
            }
        }

        var newVisualWidth = this.canvas.width / this.images.length,
            totalWidth = 0,
            length = this.images.length,
            WAVE_WING_WIDTH = 350,
            image;

        this.positionAccumulator = 0;

        for (var i = 0, length = this.images.length; i < length; i++) {
            image = this.images[i];

            if (this.pointer) {
                var centerXCoordinate = image.left + image.width / 2,
                    distanceFromCenterToMouse = this.pointer.x - centerXCoordinate,
                    normalizedDistanceFromCenterToMouse = distanceFromCenterToMouse / WAVE_WING_WIDTH,
                    weight = 1 - Math.pow(Math.abs(normalizedDistanceFromCenterToMouse), 1.4),
                    calculatedNewVisualWidth = Math.round(image.width * weight);

                image.newVisualWidth = Math.max(newVisualWidth, calculatedNewVisualWidth);
                //image.scale(calculatedNewVisualWidth / newVisualWidth);
            }
            else {
                image.newVisualWidth = newVisualWidth;
            }

            totalWidth += image.newVisualWidth;
        }

        if (totalWidth > this.canvas.width) {
            var scaleFactor = this.canvas.width / totalWidth;

            for (i = 0; i < length; i++) {
                this.images[i].newVisualWidth *= scaleFactor;
            }
        }

        for (i = 0; i < length; i++) {
            image = this.images[i];

            image.set({
                left: this.positionAccumulator + (image.newVisualWidth - image.width ) / 2,
                visualWidth: image.newVisualWidth
            });

            this.positionAccumulator += image.newVisualWidth;
        }
    };

    Fisheye.prototype.renderImagesSeparator = function () {
        var context = this.canvas.getContext();

        for (var i = 0, length = this.images.length; i < length; i++) {
            var image = this.images[i],
                rightBorder = image.left + (image.width + image.visualWidth) / 2;

            context.beginPath();
            context.moveTo(rightBorder, 0);
            context.lineTo(rightBorder, image.height);
            context.stroke();
        }
    };

    Fisheye.prototype.outputPerformanceStats = function () {
        var canvasElement = $(this.canvas.getElement());

        this.stats = new Stats();
        this.stats.setMode(0); // 0: fps, 1: ms, 2: mb

        $(this.stats.domElement)
            .appendTo(canvasElement.parent())
            .css({
                position: 'absolute',
                top: canvasElement.height() - 48,
                left: 0
            });
    };

    return Fisheye;
});