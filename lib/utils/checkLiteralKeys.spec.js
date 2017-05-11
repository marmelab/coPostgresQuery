import { assert } from 'chai';

import checkLiteralKeys from './checkLiteralKeys';

describe('checkLiteralKeys', () => {
    it('should return given object if all given keys exists', () => {
        assert.deepEqual(checkLiteralKeys(['a', 'b', 'c'])({
            a: 1,
            b: 'b',
            c: 0,
        }), {
            a: 1,
            b: 'b',
            c: 0,
        });
    });

    it('should throw an error if some key are missing', () => {
        assert.throw(() => checkLiteralKeys(['a', 'b', 'c'])({
            a: 1,
            b: 'b',
        }), 'Given object: (a, b) does not match keys: (a, b, c)');
    });

    it('should throw an error if some key are undefined', () => {
        assert.throw(() => checkLiteralKeys(['a', 'b', 'c'])({
            a: 1,
            b: 'b',
            c: undefined,
        }), 'Given object: (a, b) does not match keys: (a, b, c)');
    });

    it('should throw an error if some key are null', () => {
        assert.throw(() => checkLiteralKeys(['a', 'b', 'c'])({
            a: 1,
            b: 'b',
            c: null,
        }), 'Given object: (a, b) does not match keys: (a, b, c)');
    });

    it('should throw an error if object has more key than specified', () => {
        assert.throw(() => checkLiteralKeys(['a', 'b', 'c'])({
            a: 1,
            b: 'b',
            c: 3,
            d: 'too many',
        }), 'Given object: (a, b, c, d) does not match keys: (a, b, c)');
    });
});
