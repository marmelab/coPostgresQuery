import { assert } from 'chai';

import updateQuerier from './update';

describe('QUERY update', () => {
    it('should generate sql and parameter for updating rows', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            filterCols: ['columnc', 'columnd'],
            returnOne: true,
        });
        assert.deepEqual(updateQuery({ columnc: 1, columnd: 2 }, { columna: 1, columnb: 2 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columnc = $columnc AND columnd = $columnd
RETURNING *`
            ),
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                columnc: 1,
                columnd: 2,
            },
            returnOne: false,
        });
    });

    it('should allow to update filter', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            filterCols: ['columna', 'columnb'],
            returnOne: true,
        });
        assert.deepEqual(updateQuery({ columna: 1, columnb: 2 }, { columna: 3, columnb: 4 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columna = $columna AND columnb = $columnb
RETURNING *`
            ),
            parameters: {
                columna_u: 3,
                columnb_u: 4,
                columna: 1,
                columnb: 2,
            },
            returnOne: false,
        });
    });

    it('should ignore filters not in filterCols', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            filterCols: ['columnc'],
        });
        assert.deepEqual(updateQuery({ columnc: 1, columna: 2 }, { columna: 1, columnb: 2 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columnc = $columnc
RETURNING *`
            ),
            parameters: {
                columna_u: 1,
                columnb_u: 2,
                columnc: 1,
            },
            returnOne: false,
        });
    });

    it('should apply permanent filters', () => {
        const updateQuery = updateQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            filterCols: ['columna', 'columnb'],
            permanentFilters: { columnc: 'foo' },
            returnOne: true,
        });
        assert.deepEqual(updateQuery({ columna: 1, columnb: 2 }, { columna: 3, columnb: 4 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE columna = $columna AND columnb = $columnb AND columnc = $columnc
RETURNING *`
            ),
            parameters: {
                columna_u: 3,
                columnb_u: 4,
                columna: 1,
                columnb: 2,
                columnc: 'foo',
            },
            returnOne: false,
        });
    });
});
