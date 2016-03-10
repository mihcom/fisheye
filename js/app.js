requirejs.config({
    baseUrl: '/js',

    paths: {
        fabric: '/bower_components/fabric.js/dist/fabric.min',
        lodash: '/bower_components/lodash/dist/lodash.min',
        jquery: '/bower_components/jquery/dist/jquery.min',
        tweenjs: '/bower_components/TweenJS/lib/tweenjs-0.6.2.min',
        stats: '/bower_components/stats.js/build/stats.min',
        highlightjs: '/bower_components/highlightjs/highlight.pack.min'
    },

    shim: {
        fabric: {exports: 'fabric'},
        lodash: {exports: '_'},
        tweenjs: {exports: 'createjs'},
        stats: {exports: 'Stats'},
        highlightjs: {exports: 'hljs'}
    }
});

require(['./fisheye', 'highlightjs'], function (Fisheye, hljs) {
    'use strict';

    hljs.initHighlighting();

    //(function () {
    //    var canvas = document.querySelector('#sprite-example'),
    //        options = {
    //            canvas: canvas,
    //            imageUrl: '/images/marc-jacobs.jpg',
    //            spriteImagesCount: 41
    //        };
    //
    //    new Fisheye(options);
    //}());

    (function () {
        var canvas = document.querySelector('#image-set-example'),
            options = {
                canvas: canvas,
                imageUrl: [
                    'http://static.pandora.net/consumer/jewellery/01/400x400/750841CZ.jpg', 'http://static.pandora.net/consumer/jewellery/01/400x400/190888CFP.jpg',
                    'http://static.pandora.net/consumer/jewellery/01/400x400/190888NCK.jpg', 'http://static.pandora.net/consumer/jewellery/01/400x400/190900EN12.jpg',
                    'http://static.pandora.net/consumer/jewellery/01/400x400/190903PCZ.jpg', 'http://static.pandora.net/consumer/jewellery/01/400x400/190904CZ.jpg']
            };

        new Fisheye(options);
    }());
});