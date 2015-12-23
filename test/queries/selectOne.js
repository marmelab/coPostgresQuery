import selectOneQuerier from '../../queries/selectOne';

describe('QUERY selectOne', function () {

    it('should generate sql and parameter for upserting one entity', function () {
        const selectOneQuery = selectOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

});
