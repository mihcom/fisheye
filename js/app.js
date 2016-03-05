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

    var canvas = document.querySelector('#sprite-example'),
        options = {
            canvas: canvas,
            imageUrl: '/images/marc-jacobs.jpg',
            spriteImagesCount: 41
        };

    new Fisheye(options);
});