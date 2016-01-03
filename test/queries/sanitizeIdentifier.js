import sanitizeIdentifier from '../../queries/sanitizeIdentifier';

describe('sanitizeIdentifier', function () {
    it('should return identifier if it match identifierFields', function () {
        assert.deepEqual(
            sanitizeIdentifier([ 'id1', 'id2' ], { id1: 1, id2: 2 }),
            { id1: 1, id2: 2 }
        );
    });

    it('should return literal with identifierFields if id value is a simple data type and there is only one identifierFields', function () {
        assert.deepEqual(
            sanitizeIdentifier([ 'uid' ], 5),
            { uid: 5 }
        );
    });

    it('should throw an error if given ids does not match idFieldNames', function () {
        assert.throw(
            () => sanitizeIdentifier([ 'id', 'uid' ], { id: 1 }),
            'Given object: (id) does not match keys: (id, uid)'
        );
    });

    it('should throw an error if given idFieldNames does not match ids', function () {
        assert.throw(
            () => sanitizeIdentifier([ 'id', 'uid' ], 1),
            'Given object: (id) does not match keys: (id, uid)'
        );
    });

});
