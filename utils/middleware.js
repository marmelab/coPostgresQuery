'use strict';

export default function init(data) {
    var handlers = [];

    return {
        chain: function (fn) {
            handlers.push(fn);
            return this;
        },
        execute: function execute() {
            return handlers.reduce(function (result, handler) {
                return handler(data, result);
            });

        }
    };
};
