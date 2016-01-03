import curry from '../../utils/curry';

describe('curry', function () {
    it('should return a function', function () {
        const fn = (a1, a2, a3) => [a1, a2, a3];

        assert.isFunction(curry(fn));
    });
    describe('curried function', function () {
        const curriedFn = curry((a1, a2, a3) => [a1, a2, a3]);

        it('should return a function if called with not enough parameter', function () {

            assert.isFunction(curriedFn(1));
            assert.isFunction(curriedFn(1, 2));
        });

        it('should execute function once given enough parameter', function () {
            assert.deepEqual(curriedFn(1, 2, 3), [1, 2, 3]);
            assert.deepEqual(curriedFn(1)(2, 3), [1, 2, 3]);
            assert.deepEqual(curriedFn(1, 2)(3), [1, 2, 3]);
            assert.deepEqual(curriedFn(1)(2)(3), [1, 2, 3]);
        });

        it('should conserve parameter order', function () {
            assert.deepEqual(curriedFn(1)(2)(3), [1, 2, 3]);
            assert.deepEqual(curriedFn(3)(2)(1), [3, 2, 1]);
            assert.deepEqual(curriedFn(2)(3)(1), [2, 3, 1]);
        });
    });
});
