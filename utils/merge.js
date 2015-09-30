'use strict';

export default function merge(obj1, obj2) {
    return Object.keys(obj2)
    .reduce((mergedObject, key) => {
        mergedObject[key] = obj2[key];
        return mergedObject;
    }, obj1);
};
