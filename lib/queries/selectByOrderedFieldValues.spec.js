import { assert } from 'chai';

import selectByOrderedFieldValuesQuerier from './selectByOrderedFieldValues';

describe('QUERY selectByOrderedFieldValues', () => {
    it('should generate sql and parameter for select row by given selector list', () => {
        const selectQuery = selectByOrderedFieldValuesQuerier({
            table: 'table',
            selectorField: 'id',
            returnFields: ['fielda', 'fieldb'],
        });
        assert.deepEqual(selectQuery([1, 2]), {
            sql: (
`SELECT table.fielda, table.fieldb
FROM table
JOIN (
VALUES ($id1, 1), ($id2, 2)
) AS x (id, ordering)
ON table.id::varchar=x.id
ORDER BY x.ordering;`
            ),
            parameters: {
                id1: 1,
                id2: 2,
            },
        });
    });
});
