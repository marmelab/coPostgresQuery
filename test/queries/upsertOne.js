import upsertOneQuerier from '../../queries/upsertOne';

describe('QUERY upsertOne', function () {

    it('should generate sql and parameter for upserting one entity', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`WITH upsert AS (
    UPDATE table
    SET fielda = $fielda, fieldb = $fieldb
    WHERE id1 = $id1 AND id2 = $id2
    RETURNING table.*
)
INSERT INTO table (id1, id2, fielda, fieldb)
SELECT $id1, $id2, $fielda, $fieldb
WHERE NOT EXISTS (
    SELECT * FROM upsert
)`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

    it('should generate sql and parameter for upserting one entity ignorig autoincrement fields', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb'], ['id2']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`WITH upsert AS (
    UPDATE table
    SET fielda = $fielda, fieldb = $fieldb
    WHERE id1 = $id1 AND id2 = $id2
    RETURNING table.*
)
INSERT INTO table (id1, fielda, fieldb)
SELECT $id1, $fielda, $fieldb
WHERE NOT EXISTS (
    SELECT * FROM upsert
)`
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
