import { assert } from 'chai';
import addSuffix from './addSuffix';

describe('batchParameter', () => {
    it('addSuffix should add given suffix to all object attributes', () => {
        assert.deepEqual(addSuffix({ a: 1, b: 2, c: 3 }, 56), { a56: 1, b56: 2, c56: 3 });
    });
});
