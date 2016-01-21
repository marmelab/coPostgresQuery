import arrayToLitteral from '../../utils/arrayToLitteral';

describe('arrayToLitteral', function () {
    it('should convert [keys] and [values] to literal', function () {
        assert.deepEqual(arrayToLitteral(['a', 'b'], [1, 2]), { a: 1, b: 2 });
    });

    it('should use value for all key if it is not an array of value', function () {
        assert.deepEqual(arrayToLitteral(['a', 'b'], 7), { a: 7, b: 7 });
    });

    it('should default values to undefined if not specified', function () {
        assert.deepEqual(arrayToLitteral(['a', 'b']), { a: undefined, b: undefined });
    });

    it('should accept null as value', function () {
        assert.deepEqual(arrayToLitteral(['a', 'b'], null), { a: null, b: null });
    });
});
