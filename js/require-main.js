requirejs.config({
    baseUrl: '/js',

    paths: {
        app: 'app',
        fabric: '/bower_components/fabric.js/dist/fabric.min',
        underscore: '/bower_components/underscore/underscore-min',
        jquery: '/bower_components/jquery/dist/jquery.min',
        json2: '/bower_components/json2/json2',
        d3: '/bower_components/d3/d3.min',
        'd3.fisheye': '/js/helpers/d3.fisheye',
        'fisheye.canvas': 'fisheye/fisheye.canvas',
        backbone: '/bower_components/backbone/backbone-min',
        marionette: '/bower_components/backbone.marionette/lib/backbone.marionette',
        text: '/bower_components/text/text'
    },

    shim: {
        fabric: {exports: 'fabric'},
        d3: {exports: 'd3'},
        'd3.fisheye': {
            deps: ['d3'],
            exports: 'd3.fisheye'
        },
        underscore: {exports: '_'},
        backbone: {
            deps: ['jquery', 'underscore', 'json2'],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        app: {
            deps: ['config/templatesettings', 'config/view', 'config/string.format']
        }
    }
});

require(['app'], function (App) {
    'use strict';

    App.start();
    //
    // (function () {
    //     var canvas = document.querySelector('#sprite-example'),
    //         options = {
    //             canvas: canvas,
    //             imageUrl: '/images/marc-jacobs.jpg',
    //             spriteImagesCount: 41,
    //             distortion: 2
    //         };
    //
    //     new Fisheye(options);
    // }());

    // (function () {
    //     var canvas = document.querySelector('#image-set-example'),
    //         options = {
    //             canvas: canvas,
    //             imageUrl: [
    //                 'http://static.pandora.net/consumer/jewellery/01/400x400/750841CZ.jpg', 'http://static.pandora.net/consumer/jewellery/01/400x400/190888CFP.jpg',
    //                 'http://static.pandora.net/consumer/jewellery/01/400x400/190888NCK.jpg', 'http://static.pandora.net/consumer/jewellery/01/400x400/190900EN12.jpg',
    //                 'http://static.pandora.net/consumer/jewellery/01/400x400/190903PCZ.jpg', 'http://static.pandora.net/consumer/jewellery/01/400x400/190904CZ.jpg']
    //         };
    //
    //     new Fisheye(options);
    // }());
});