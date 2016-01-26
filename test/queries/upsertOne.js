import upsertOneQuerier from '../../queries/upsertOne';

describe('QUERY upsertOne', function () {

    it('should generate sql and parameter for upserting one entity', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`INSERT INTO table (id1, id2, fielda, fieldb)
VALUES ($id1, $id2, $fielda, $fieldb)
ON CONFLICT (id1, id2) DO UPDATE
SET fielda = $fielda, fieldb = $fieldb
RETURNING *`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

    it('should generate sql and parameter for upserting one entity ignoring autoincrement fields', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb'], ['id2']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`INSERT INTO table (id1, fielda, fieldb)
VALUES ($id1, $fielda, $fieldb)
ON CONFLICT (id1, id2) DO UPDATE
SET fielda = $fielda, fieldb = $fieldb
RETURNING *`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });
});
