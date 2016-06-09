import selectByQuerier from '../../lib/queries/selectByFieldValues';

describe('QUERY selectBy', function () {

    it('should generate sql and parameter for select entity by given selector list', function () {
        const selectByQuery = selectByQuerier('table', 'id', ['fielda', 'fieldb']);
        assert.deepEqual(selectByQuery([1, 2]), {
            sql: `SELECT table.fielda, table.fieldb\nFROM table\nJOIN (\nVALUES ($id1, 1), ($id2, 2)\n) AS x (id, ordering)\nON table.id::varchar=x.id\nORDER BY x.ordering;`,
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

});
