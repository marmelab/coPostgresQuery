import arrayToLitteral from '../../lib/utils/arrayToLitteral';

describe('arrayToLitteral', () => {
    it('should convert [keys] and [values] to literal', () => {
        assert.deepEqual(arrayToLitteral(['a', 'b'], [1, 2]), { a: 1, b: 2 });
    });

    it('should use value for all key if it is not an array of value', () => {
        assert.deepEqual(arrayToLitteral(['a', 'b'], 7), { a: 7, b: 7 });
    });

    it('should default values to undefined if not specified', () => {
        assert.deepEqual(arrayToLitteral(['a', 'b']), { a: undefined, b: undefined });
    });

    it('should accept null as value', () => {
        assert.deepEqual(arrayToLitteral(['a', 'b'], null), { a: null, b: null });
    });
});
