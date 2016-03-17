var assert = require('chai').assert;

module.exports = function (select, watchedFields) {
    return function* hasChange(entity) {
        var old = yield select.selectOneById(entity.id);
        var copy = {};
        var original = {};
        watchedFields.forEach(function (key) {
            original[key] = old[key];

            // undefined is considered has no change
            copy[key] = typeof entity[key] !== 'undefined' ? entity[key] : original[key];
        });

        try {
            assert.deepEqual(copy, original);
        } catch (e) {
            return true;
        }

        return false;
    };
};
