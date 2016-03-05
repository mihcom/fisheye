requirejs.config({
    baseUrl: '/js',

    paths: {
        fabric: '/bower_components/fabric.js/dist/fabric.min',
        lodash: '/bower_components/lodash/dist/lodash.min',
        jquery: '/bower_components/jquery/dist/jquery.min',
        tweenjs: '/bower_components/TweenJS/lib/tweenjs-0.6.2.min',
        stats: '/bower_components/stats.js/build/stats.min'
    },

    shim: {
        fabric: {exports: 'fabric'},
        lodash: {exports: '_'},
        tweenjs: {exports: 'createjs'},
        stats: {exports: 'Stats'}
    }
});

require(['./fisheye'], function (Fisheye) {
    'use strict';

    var canvas = document.querySelector('canvas'),
        options = {
            canvas: canvas,
            imageUrl: '/images/marc-jacobs.jpg',
            spriteImagesCount: 41
        };

    new Fisheye(options);
});