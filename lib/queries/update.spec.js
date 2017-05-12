import { assert } from 'chai';

import updateQuerier from './update';

describe('QUERY update', () => {
    it('should generate sql and parameter for updating rows', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            filterFields: ['fieldc', 'fieldd'],
            returnOne: true,
        });
        assert.deepEqual(updateQuery({ fieldc: 1, fieldd: 2 }, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE fieldc = $fieldc AND fieldd = $fieldd
RETURNING *`
            ),
            parameters: {
                fielda_u: 1,
                fieldb_u: 2,
                fieldc: 1,
                fieldd: 2,
            },
            returnOne: false,
        });
    });

    it('should allow to update filter', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            filterFields: ['fielda', 'fieldb'],
            returnOne: true,
        });
        assert.deepEqual(updateQuery({ fielda: 1, fieldb: 2 }, { fielda: 3, fieldb: 4 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE fielda = $fielda AND fieldb = $fieldb
RETURNING *`
            ),
            parameters: {
                fielda_u: 3,
                fieldb_u: 4,
                fielda: 1,
                fieldb: 2,
            },
            returnOne: false,
        });
    });

    it('should ignore filters not in filterFields', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            filterFields: ['fieldc'],
        });
        assert.deepEqual(updateQuery({ fieldc: 1, fielda: 2 }, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE fieldc = $fieldc
RETURNING *`
            ),
            parameters: {
                fielda_u: 1,
                fieldb_u: 2,
                fieldc: 1,
            },
            returnOne: false,
        });
    });
});
