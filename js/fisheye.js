define(['fabric', 'lodash', 'jquery', 'tweenjs', 'helpers/requestAnimationFrame'], function (fabric, _, $, createjs) {
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
                height: 225,
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

            tempCanvas.add(spriteImage);

            for (var i = 0; i < this.options.spriteImagesCount; i++) {
                spriteImage.left = -imageWidth * i;
                tempCanvas.renderAll();

                var image = new window.Image();
                image.src = tempCanvas.toDataURL();

                var line = new fabric.Line([0, 0, 0, imageHeight], { strokeWidth: 1, stroke: 'black', top : 0}),
                    spriteElement = new fabric.Image(image, {
                        selectable: false,
                        width: imageWidth,
                        height: imageHeight,
                        left: i * imageWidth,
                        visualWidth: imageWidth,
                        line: line,
                        index: i
                    });

                spriteElement.clipTo = this.applyFishEyeToImage.bind(this, spriteElement);

                this.images.push(spriteElement);
                this.canvas.add(spriteElement);
                this.canvas.add(spriteElement.line);
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
                var pointer = options.target ? canvas.getPointer(options.e) : undefined;
                this.updateFishEye({pointer: pointer});
            }.bind(this));

            $(this.options.canvas).parent().mouseout(this.updateFishEye.bind(this));

            var updateCanvas = function () {
                canvas.renderAll();
                window.requestAnimationFrame(updateCanvas);
            };

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

        if (!options.pointer) {
            //delete this.pointer;
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

        var newVisualWidth = this.canvas.width / this.options.spriteImagesCount,
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
                    weight = -Math.pow(Math.abs(normalizedDistanceFromCenterToMouse), 1.4) + 1,
                    calculatedNewVisualWidth = image.width * weight;

                image.newVisualWidth = Math.max(newVisualWidth, calculatedNewVisualWidth);
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
                //visible: false
            });

            //if (i === 1){
            //    if (Math.abs((this.im1 || 0) - image.left) >= 1){
            //        window.console.log(this.im1, image.left);
            //        this.im1 = image.left;
            //    }
            //}

            image.line.set({
                left: image.left + (image.newVisualWidth + image.width) / 2,
            });

            image.line.bringToFront();

            this.positionAccumulator += image.newVisualWidth;
        }
    };

    return Fisheye;
});