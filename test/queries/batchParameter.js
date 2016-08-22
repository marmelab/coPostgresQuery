import batchParameter, { addSuffix } from '../../lib/queries/batchParameter';

describe('batchParameter', () => {
    it('addSuffix should add given suffix to all object attributes', () => {
        assert.deepEqual(addSuffix({ a: 1, b: 2, c: 3 }, 56), { a56: 1, b56: 2, c56: 3 });
    });

    it('should return batchParameter', () => {
        assert.deepEqual(batchParameter(['a', 'b', 'c'])([
            { a: 1, b: 2, c: 3 },
            { a: 11, b: 12, c: 13, d: 'ignored' },
            { a: 21, b: 22 },
        ]), {
            a1: 1, b1: 2, c1: 3,
            a2: 11, b2: 12, c2: 13,
            a3: 21, b3: 22, c3: null,
        });
    });
});
