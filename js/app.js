define(['jquery', 'marionette'], function ($, Marionette) {
    'use strict';

    var App = new Marionette.Application(),
        API = {
            runExamples: function () {
                require(['fisheye/annotated_fisheye/controller'], function (AnnotatedFisheye) {
                    var products = ['750841CZ', '190888CFP', '190888NCK', '190900EN12', '190903PCZ', '190904CZ',
                            '290544CFP', '290544NCK', '290552ACZ', '290552LCZ', '290553CZ', '390961COE-100',
                            '791813CZ', '791827EN40', '791838', '791919ENMX', '750840CZ', '791740'],
                        productsImages = _.map(products, function (id) {
                            return '//static.pandora.net/consumer/jewellery/01/236x190/{0}.jpg'.format(id);
                        }),
                        options = {
                            el: $('[data-role="demo"]'),
                            imageUrl: productsImages,
                            distortion: 2,
                            annotations: {
                                '2': 'New arrivals',
                                '4-7': 'Etiam mi velit, laoreet id blandit at, euismod fermentum ante.',
                                '12-17': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque erat magna, sodales sit amet purus ut, ultrices tincidunt diam. Curabitur molestie odio id feugiat lacinia. Aenean ullamcorper nunc sapien, sed malesuada lacus venenatis sit amet.'
                            }
                        };

                    new AnnotatedFisheye(options);
                });
            }
        };

    App.on('start', API.runExamples);

    return App;
});