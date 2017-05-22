import { assert } from 'chai';

import selectByOrderedIdentifiers from './selectByOrderedIdentifiers';

describe('QUERY selectByOrderedIdentifiers', () => {
    it('should generate sql and parameter for select row by given selector list', () => {
        const selectQuery = selectByOrderedIdentifiers({
            table: 'table',
            primaryKey: 'id',
            returnCols: ['cola', 'colb'],
        });
        assert.deepEqual(selectQuery([1, 2]), {
            sql: (
`SELECT table.cola, table.colb
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
