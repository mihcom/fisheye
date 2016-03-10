define(['lodash', 'jquery', 'stats'], function (_, $, Stats) {
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
        this.stats.begin();

        var canvasWidth = this.options.canvas.width,
            canvasHeight = this.options.canvas.height,
            imageCropWidth = canvasWidth / this.images.length;

        this.canvas.clearRect(0, 0, canvasWidth, canvasHeight);

        _.each(this.images, function (image, index) {
            this.canvas.drawImage(image, (image.width - imageCropWidth ) / 2, 0, imageCropWidth, canvasHeight, index * imageCropWidth, 0, imageCropWidth, canvasHeight);
        }.bind(this));

        this.stats.end();
    };

    Fisheye.prototype.run = function () {
        this.options.canvas.height = this.images[0].height;
        this.options.canvas.width = $(this.options.canvas).width();
        $(this.options.canvas).height(this.images[0].height);

        this.canvas = this.options.canvas.getContext('2d');

        this.outputPerformanceStats();

        this.updateFisheye();

        $(window).resize(function (){
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