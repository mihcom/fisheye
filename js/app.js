requirejs.config({
    baseUrl: '/js',

    paths: {
        fabric: '/bower_components/fabric.js/dist/fabric.min',
        lodash: '/bower_components/lodash/dist/lodash.min',
        jquery: '/bower_components/jquery/dist/jquery.min'
    },

    shim: {
        fabric: {
            exports: 'fabric'
        },

        lodash: {
            exports: '_'
        }
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