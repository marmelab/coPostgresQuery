import selectByOrderedFieldValuesQuerier from '../../lib/queries/selectByOrderedFieldValues';

describe('QUERY selectByOrderedFieldValues', function () {

    it('should generate sql and parameter for select entity by given selector list', function () {
        const selectByOrderedFieldValuesQuery = selectByOrderedFieldValuesQuerier('table', 'id', ['fielda', 'fieldb']);
        assert.deepEqual(selectByOrderedFieldValuesQuery([1, 2]), {
            sql: `SELECT table.fielda, table.fieldb\nFROM table\nJOIN (\nVALUES ($id1, 1), ($id2, 2)\n) AS x (id, ordering)\nON table.id::varchar=x.id\nORDER BY x.ordering;`,
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

});
