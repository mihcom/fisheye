define(['lodash', 'jquery', 'd3', 'd3.fisheye'], function (_, $, d3) {
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

        this.options = _.defaults(options, {distortion: 'max'});

        $.when(this.loadAssets()).then(this.run.bind(this));

        return {};
    };

    Fisheye.prototype.loadAssets = function () {
        var ready = new $.Deferred(),
            imageLoad = _.isString(this.options.imageUrl) ? this.loadImagesFromSprite() : this.loadImagesFromSet();

        $.when(imageLoad).then(function (images) {
            if (images.length < 2) {
                throw new Error('At least two images are required');
            }

            this.images = images;
            ready.resolve();
        }.bind(this));

        return ready.promise();
    };

    Fisheye.prototype.loadImagesFromSprite = function () {
        var deferred = new $.Deferred(),
            images = [],
            spriteImage = document.createElement('img');

        spriteImage.onload = function () {
            for (var i = 0; i < this.options.spriteImagesCount; i++) {
                var canvas = document.createElement('canvas'),
                    context = canvas.getContext('2d');

                canvas.width = context.width = spriteImage.width / this.options.spriteImagesCount;
                canvas.height = context.height = spriteImage.height;

                context.drawImage(spriteImage, i * context.width, 0, context.width, context.height, 0, 0, context.width, context.height);

                images.push(canvas);
            }

            deferred.resolve(images);
        }.bind(this);

        spriteImage.src = this.options.imageUrl;

        return deferred.promise();
    };

    // TODO: implement
    Fisheye.prototype.loadImagesFromSet = function () {
        var deferred = new $.Deferred(),
            images = [],
            promises = _.map(this.options.imageUrl, function (url, index) {
                var imageDeferred = new $.Deferred(),
                    image = document.createElement('img');

                images[index] = image;

                image.onload = imageDeferred.resolve.bind(imageDeferred, image);
                image.src = url;

                return imageDeferred.promise();
            });

        $.when.apply($, promises).then(deferred.resolve.bind(deferred, images));

        return deferred.promise();
    };

    Fisheye.prototype.updateFisheye = function () {
        if (this.fishEyeApplied) {
            this.fishEyeApplied.cancel = true;
        }

        var canvasWidth = this.options.canvas.width,
            canvasHeight = this.options.canvas.height,
            imageCropWidth = canvasWidth / this.images.length,
            data = d3.range(0, canvasWidth, imageCropWidth),
            detachedContainer = document.createElement('custom'),
            dataContainer = d3.select(detachedContainer),
            dataBinding = dataContainer.selectAll('custom').data(data),
            xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, canvasWidth]).distortion(0),
            distortion = this.calculateDistortion(xFisheye, data),
            canvas = this.canvas,
            images = this.images,
            fishEyeApplied = this.fishEyeApplied = {},
            update = function () {
                this.canvas.clearRect(0, 0, canvasWidth, canvasHeight);

                var elements = dataContainer.selectAll('custom');

                canvas.strokeStyle = 'black';
                canvas.beginPath();

                elements.each(function (value, index) {
                    if (index >= images.length) {
                        return;
                    }

                    var node = d3.select(this),
                        nextNode = elements.filter(function (d, i) {
                            return i === index + 1;
                        }),
                        currentNodeX = node.attr('x'),
                        nextNodeX = nextNode.size() ? nextNode.attr('x') : canvasWidth,
                        image = images[index],
                        imagePartWidth = Math.min(nextNodeX - currentNodeX, image.width);

                    canvas.moveTo(currentNodeX, 0);
                    canvas.lineTo(currentNodeX, canvasHeight);

                    canvas.drawImage(image,
                        (image.width - imagePartWidth) / 2, 0, imagePartWidth, canvasHeight,
                        currentNodeX, 0, imagePartWidth, canvasHeight);
                });

                canvas.stroke();

                return fishEyeApplied.cancel;
            }.bind(this);

        dataBinding.enter()
            .append('custom')
            .attr('x', xFisheye);

        var setDistortion = function (distortion, e) {
            var xCoord = (e.type === 'touchstart' || e.type === 'touchmove') ? e.originalEvent.touches[0].pageX : e.clientX;

            xFisheye.distortion(distortion);

            if (xCoord !== undefined) {
                xFisheye.focus(xCoord);
            }

            dataBinding
                .transition()
                .ease('cubic-out')
                .duration(300)
                .attr('x', xFisheye)
        };

        $(this.options.canvas).off('mousemove touchstart touchmove').on('touchstart touchmove mousemove', setDistortion.bind(this, distortion));
        $(this.options.canvas).off('mouseout touchend').on('mouseout touchend', setDistortion.bind(this, 0));

        d3.timer(update);
    };

    Fisheye.prototype.calculateDistortion = function (scale, data) {
        var scaleDistortion = scale.distortion(),
            imageWidth = this.images[0].width,
            step = 0.1,
            distortion = (_.isNumber(this.options.distortion) ? this.options.distortion : 5) + step;

        do {
            distortion -= step;
            scale.distortion(distortion);
        }
        while (scale(data[1]) > imageWidth);

        scale.distortion(scaleDistortion);

        return distortion;
    };

    Fisheye.prototype.run = function () {
        this.options.canvas.height = this.images[0].height;
        this.options.canvas.width = $(this.options.canvas).width();
        $(this.options.canvas).height(this.images[0].height);

        this.canvas = this.options.canvas.getContext('2d');

        this.updateFisheye();

        $(window).resize(function () {
            this.options.canvas.width = $(this.options.canvas).width();
            this.updateFisheye();
        }.bind(this));
    };

    return Fisheye;
});