define([], function () {
    'use strict';

    String.prototype.format = function () {
        var s = this,
            i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i] === null ? '' : arguments[i]);
        }

        return s;
    };
});

