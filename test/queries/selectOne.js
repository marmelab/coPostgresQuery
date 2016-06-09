import selectOneQuerier from '../../lib/queries/selectOne';

describe('QUERY selectOne', function () {

    it('should generate sql and parameter for selecting one entity', function () {
        const selectOneQuery = selectOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2 }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should generate sql and parameter for selecting one entity when receiving single value as parameter', function () {
        const selectOneQuery = selectOneQuerier('bib_user', [ 'username' ], ['*']);
        assert.deepEqual(selectOneQuery('john'), {
            sql: 'SELECT * FROM bib_user WHERE username = $username LIMIT 1',
            parameters: {
                username: 'john'
            }
        });
    });

    it('should ignore parameters not in idFields', function () {
        const selectOneQuery = selectOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should be configurable', function () {
        const selectOneQuery = selectOneQuerier()
        .table('table')
        .idFields([ 'id1', 'id2' ])
        .returnFields(['fielda', 'fieldb']);

        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2 }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

});