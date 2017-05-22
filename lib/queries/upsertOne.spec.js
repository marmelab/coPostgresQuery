import { assert } from 'chai';

import upsertOneQuerier from './upsertOne';

describe('QUERY upsertOne', () => {
    it('should generate sql and parameter for upserting one row', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id1', 'id2'],
            writableCols: ['columna', 'columnb'],
        });
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, columna: 'a', columnb: 'b' }), {
            sql: (
`INSERT INTO table (id1, id2, columna, columnb)
VALUES ($id1, $id2, $columna, $columnb)
ON CONFLICT (id1, id2)
DO UPDATE SET columna = $columna, columnb = $columnb
RETURNING *`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                columna: 'a',
                columnb: 'b',
            },
            returnOne: true,
        });
    });

    it(
    'should generate query for upserting using same order for (column...) and VALUES(column...)',
    () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableCols: ['column'],
        });
        assert.deepEqual(upsertOneQuery({ column: 'value', id: 1 }), {
            sql: (
`INSERT INTO table (id, column)
VALUES ($id, $column)
ON CONFLICT (id)
DO UPDATE SET column = $column
RETURNING *`
            ),
            parameters: {
                id: 1,
                column: 'value',
            },
            returnOne: true,
        });
    });

    it('should not try to update column not passed in row', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableCols: ['columna', 'columnb'],
        });
        assert.deepEqual(upsertOneQuery({ columna: 'value', id: 1 }), {
            sql: (
`INSERT INTO table (id, columna)
VALUES ($id, $columna)
ON CONFLICT (id)
DO UPDATE SET columna = $columna
RETURNING *`
            ),
            parameters: {
                id: 1,
                columna: 'value',
            },
            returnOne: true,
        });
    });

    it('should DO NOTHING on conflict when no value provided to updatable column', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableCols: ['column'],
        });
        assert.deepEqual(upsertOneQuery({ id: 1 }), {
            sql: (
`INSERT INTO table (id)
VALUES ($id)
ON CONFLICT (id)
DO NOTHING
RETURNING *`
            ),
            parameters: {
                id: 1,
            },
            returnOne: true,
        });
    });

    it('should accept to have no writableCols', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableCols: [],
        });
        assert.deepEqual(upsertOneQuery({ id: 1 }), {
            sql: (
`INSERT INTO table (id)
VALUES ($id)
ON CONFLICT (id)
DO NOTHING
RETURNING *`
            ),
            parameters: {
                id: 1,
            },
            returnOne: true,
        });
    });
});
