import { assert } from 'chai';
import sanitizeIdentifier from './sanitizeIdentifier';

describe('sanitizeIdentifier', () => {
    it('should return identifier if it match identifierFields', () => {
        assert.deepEqual(
            sanitizeIdentifier(['id1', 'id2'], { id1: 1, id2: 2 }),
            { id1: 1, id2: 2 }
        );
    });

    it(`should return literal with identifierFields
        if id value is a simple data type
        and there is only one identifierFields`,
    () => {
        assert.deepEqual(
            sanitizeIdentifier(['uid'], 5),
            { uid: 5 }
        );
    });

    it('should filterout id Keys not present in given identifierFields', () => {
        assert.deepEqual(
            sanitizeIdentifier(['id'], { id: 1, uid: 2 }),
            { id: 1 }
        );
    });

    it('should throw an error if given ids does not match idFieldNames', () => {
        assert.throw(
            () => sanitizeIdentifier(['id', 'uid'], { id: 1 }),
            'Invalid identifier: Given object: (id) does not match keys: (id, uid)'
        );
    });

    it('should throw an error if given idFieldNames does not match ids', () => {
        assert.throw(
            () => sanitizeIdentifier(['id', 'uid'], 1),
            'Invalid identifier: Given object: (id) does not match keys: (id, uid)'
        );
    });
});
