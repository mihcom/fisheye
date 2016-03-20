define(['underscore', 'backbone', 'jquery', 'd3', 'd3.fisheye'], function (_, Backbone, $, d3) {
    'use strict';

    var Fisheye = function (options) {
        this.options = _.defaults(options, {distortion: 'max'});
        this.started = new $.Deferred();

        $.when(this.loadAssets()).then(this.run.bind(this));
    };

    _.extend(Fisheye.prototype, Backbone.Events);

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
            imageHeight =this.images[0].height,
            leftOffset = $(this.options.canvas).offset().left,
            imageCropWidth = canvasWidth / this.images.length,
            data = d3.range(0, canvasWidth, imageCropWidth),
            detachedContainer = document.createElement('custom'),
            dataContainer = d3.select(detachedContainer),
            dataBinding = dataContainer.selectAll('custom').data(data),
            triggerChange = _.throttle(function () {
                this.trigger('change');
            }.bind(this), 1),
            xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, canvasWidth]).distortion(0),
            distortion = this.calculateDistortion(xFisheye, data),
            canvas = this.canvas,
            images = this.images,
            fishEyeApplied = this.fishEyeApplied = {},
            update = function () {
                this.canvas.clearRect(0, 0, canvasWidth, canvasHeight);

                canvas.strokeStyle = 'black';
                canvas.beginPath();

                dataBinding.each(function (value, index) {
                    if (index >= images.length) {
                        return;
                    }

                    var node = d3.select(this),
                        nextNode = dataBinding.filter(function (d, i) {
                            return i === index + 1;
                        }),
                        currentNodeX = +node.attr('x'),
                        nextNodeX = nextNode.size() ? nextNode.attr('x') : canvasWidth,
                        image = images[index],
                        imageVisualWidth = Math.min(nextNodeX - currentNodeX, image.width);

                    image.position = currentNodeX;
                    image.visualWidth = imageVisualWidth;

                    canvas.moveTo(currentNodeX, 0);
                    canvas.lineTo(currentNodeX, imageHeight);

                    canvas.drawImage(image,
                        (image.width - imageVisualWidth) / 2, 0, imageVisualWidth, imageHeight,
                        currentNodeX, 0, imageVisualWidth, imageHeight);
                });

                canvas.stroke();

                if (xFisheye.distortion() > 0){
                    var focus = xFisheye.focus(),
                        focusedImage = _.find(images, function (image) {
                            return (image.position <= focus) && (image.position + image.visualWidth >= focus);
                        });

                    if (focusedImage){
                        canvas.strokeStyle = 'silver';
                        canvas.beginPath();

                        canvas.moveTo(focusedImage.position, canvasHeight - 1);
                        canvas.lineTo(focusedImage.position + focusedImage.visualWidth, canvasHeight - 1);

                        canvas.stroke();
                    }
                }

                return fishEyeApplied.cancel;
            }.bind(this);

        dataBinding.enter()
            .append('custom')
            .attr('x', xFisheye);

        var setDistortion = function (distortion, e) {
            var xCoord = (e.type === 'touchstart' || e.type === 'touchmove') ? e.originalEvent.touches[0].pageX : e.clientX;

            xFisheye.distortion(distortion);

            if (xCoord !== undefined) {
                xFisheye.focus(xCoord - leftOffset);
            }

            dataBinding
                .transition()
                .ease('cubic-out')
                .duration(300)
                .tween('fisheye', function (){
                    return function() {
                        triggerChange();
                    };
                })
                .attr('x', xFisheye)
                .filter(function (d, i) {
                    return i === images.length - 1;
                })
                .each('end', triggerChange);
        };

        $(this.options.canvas).off('mousemove touchstart touchmove').on('touchstart touchmove mousemove', setDistortion.bind(this, distortion));
        $(this.options.canvas).off('mouseout touchend').on('mouseout touchend', setDistortion.bind(this, 0));

        _.defer(triggerChange);

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

    Fisheye.prototype.getVisualRange = function (range) {
        return {
            lower: this.images[range.lower].position,
            upper: this.images[range.upper].position + this.images[range.upper].visualWidth
        };
    };

    Fisheye.prototype.run = function () {
        this.options.canvas.height = this.images[0].height + 2;

        this.options.canvas.width = $(this.options.canvas).width();
        this.options.canvas.width = $(this.options.canvas).width(); // for some reason first width set is incorrect

        $(this.options.canvas).height(this.images[0].height);

        this.canvas = this.options.canvas.getContext('2d');

        this.updateFisheye();

        $(window).resize(function () {
            this.options.canvas.width = $(this.options.canvas).width();
            this.updateFisheye();
        }.bind(this));

        _.delay(this.started.resolve.bind(this.started), 50);
    };

    Fisheye.prototype.ready = function () {
        return this.started.promise();
    };

    return Fisheye;
});