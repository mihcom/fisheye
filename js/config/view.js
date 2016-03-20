define(['marionette'], function (Marionette) {
    'use strict';

    var mixin = {
        serializeData: function () {
            var model;

            if (this.model) {
                model = this.model.toJSON();
            } else {
                model = {};
            }

            model.model = model;
            model.backboneModel = this.model;
            model.view = this;

            return model;
        }
    };

    Marionette.ItemView = Marionette.ItemView.extend(mixin);
});
