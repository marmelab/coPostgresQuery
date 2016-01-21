import batchParameter, { addSuffix, merge } from '../../queries/batchParameter';

describe('batchParameter', function () {
    it('addSuffix should add given suffix to all object attributes', function () {
        assert.deepEqual(addSuffix({a: 1, b: 2, c: 3}, 56), {a56: 1, b56: 2, c56: 3});
    });

    it('merge, should fuse two given object together', function () {
        assert.deepEqual(merge({a: 1, b: 2}, {c: 3}), {a: 1, b: 2, c: 3 });
    });

    it('merge, should override first object attribute with the second one, if they overlap', function () {
        assert.deepEqual(merge({a: 1, b: 2}, { b: 'override', c: 3}), {a: 1, b: 'override', c: 3 });
    });

    it('should return batchParameter', function () {
        assert.deepEqual(batchParameter(['a', 'b', 'c'])([
            { a: 1, b: 2, c: 3 },
            { a: 11, b: 12, c: 13, d: 'ignored' },
            { a: 21, b: 22 }
        ]), {
            a0: 1, b0: 2, c0: 3,
            a1: 11, b1: 12, c1: 13,
            a2: 21, b2: 22, c2: null
        });
    });
});
