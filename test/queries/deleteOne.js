import deleteOne from '../../lib/queries/deleteOne';

describe('QUERY deleteOne', function () {

    it('should generate sql and parameter for selecting one entity', function () {
        const deleteOneQuery = deleteOne('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2 }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING fielda, fieldb',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should ignore parameters not in selectors', function () {
        const deleteOneQuery = deleteOne('table', [ 'id1', 'id2' ], ['*']);
        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING *',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should be configurable', function () {
        const deleteOneQuery = deleteOne()
        .table('table')
        .idFields([ 'id1', 'id2' ])
        .returnFields(['fielda', 'fieldb']);

        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2 }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING fielda, fieldb',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

});
