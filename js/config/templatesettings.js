define(['underscore'], function (_) {
    'use strict';

    _.templateSettings = {
        escape: /\{\{=(.+?)\}\}/g,

        evaluate: /\{%(.+?)%\}/gm,

        interpolate: /\{\{(.+?)\}\}/g
    };
});