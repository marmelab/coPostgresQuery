'use strict';

module.exports = function merge(obj1, obj2) {
    for (var attrName in obj2) {
        if (!obj2.hasOwnProperty(attrName)) {
            continue;
        }

        obj1[attrName] = obj2[attrName];
    }

    return obj1;
};
