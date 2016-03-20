define(['jquery', 'marionette'], function ($, Marionette) {
    'use strict';

    var App = new Marionette.Application(),
        API = {
            runExamples: function () {
                require(['fisheye/annotated_fisheye/controller'], function (AnnotatedFisheye) {
                    var options = {
                        el: $('[data-role="demo"]'),
                        imageUrl: '/images/marc-jacobs.jpg',
                        spriteImagesCount: 41,
                        distortion: 2,
                        annotations: {
                            '2': 'From new collection',
                            '6-11': 'Etiam mi velit, laoreet id blandit at, euismod fermentum ante.',
                            '25-38': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque erat magna, sodales sit amet purus ut, ultrices tincidunt diam. Curabitur molestie odio id feugiat lacinia. Aenean ullamcorper nunc sapien, sed malesuada lacus venenatis sit amet.'
                        }
                    };

                    new AnnotatedFisheye(options);
                });
            }
        };

    App.on('start', API.runExamples);

    return App;
});