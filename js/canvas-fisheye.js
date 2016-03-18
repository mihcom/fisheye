define(['lodash', 'jquery', 'd3', 'd3.fisheye', 'stats'], function (_, $, d3, fisheye, Stats) {
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

        this.options = _.defaults(options, {distortion: 2});

        $.when(this.loadAssets()).then(this.run.bind(this));

        return {};
    };

    Fisheye.prototype.loadAssets = function () {
        var ready = new $.Deferred(),
            imageLoad = _.isString(this.options.imageUrl) ? this.loadImagesFromSprite() : this.loadImagesFromSet();

        $.when(imageLoad).then(function (images) {
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
    Fisheye.prototype.loadImagesFromSet = _.noop;

    Fisheye.prototype.updateFisheye = function () {
        var canvasWidth = this.options.canvas.width,
            canvasHeight = this.options.canvas.height,
            imageCropWidth = canvasWidth / this.images.length,
            data = d3.range(0, canvasWidth, imageCropWidth),
            detachedContainer = document.createElement('custom'),
            dataContainer = d3.select(detachedContainer),
            dataBinding = dataContainer.selectAll('custom').data(data),
            xFisheye = d3.fisheye.scale(d3.scale.identity)
                .domain([0, canvasWidth])
                .focus(canvasWidth / 2)
                .distortion(0),
            canvas = this.canvas,
            images = this.images,
            update = function () {
                this.stats.begin();

                this.canvas.clearRect(0, 0, canvasWidth, canvasHeight);

                var elements = dataContainer.selectAll('custom');

                canvas.strokeStyle = 'black';
                canvas.beginPath();

                elements.each(function (value, index) {
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

                    // canvas.drawImage(image, (image.width - width ) / 2, 0, width,
                    //     canvasHeight, xPosition, 0, width, canvasHeight);
                    //
                    // if (index <= 1){
                    //     window.console.log(index, xPosition, width);
                    // }
                });

                canvas.stroke();

                this.stats.end();
            }.bind(this);

        dataBinding.enter()
            .append('custom')
            .attr('x', xFisheye);

        var setDistortion = function (distortion, e){
            xFisheye.focus(e.clientX).distortion(distortion);

            dataBinding
                .transition()
                .ease('cubic-out')
                .duration(500)
                .attr('x', xFisheye)
        };

        $(this.options.canvas).mousemove(setDistortion.bind(this, this.options.distortion));
        $(this.options.canvas).mouseout(setDistortion.bind(this, 0));

        d3.timer(update);
    };

    Fisheye.prototype.run = function () {
        this.options.canvas.height = this.images[0].height;
        this.options.canvas.width = $(this.options.canvas).width();
        $(this.options.canvas).height(this.images[0].height);

        this.canvas = this.options.canvas.getContext('2d');

        this.outputPerformanceStats();

        this.updateFisheye();

        $(window).resize(function () {
            this.options.canvas.width = $(this.options.canvas).width();
            this.updateFisheye();
        }.bind(this));
    };

    Fisheye.prototype.outputPerformanceStats = function () {
        var canvasElement = $(this.options.canvas);

        this.stats = new Stats();
        this.stats.setMode(0); // 0: fps, 1: ms, 2: mb

        $(this.stats.domElement)
            .appendTo(canvasElement.parent())
            .css({
                position: 'absolute',
                top: canvasElement.height() - 5,
                left: 21
            });
    };

    return Fisheye;
});