import { assert } from 'chai';

import upsertOneQuerier from './upsertOne';

describe('QUERY upsertOne', () => {
    it('should generate sql and parameter for upserting one entity', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id1', 'id2'],
            writableFields: ['fielda', 'fieldb'],
        });
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`INSERT INTO table (id1, id2, fielda, fieldb)
VALUES ($id1, $id2, $fielda, $fieldb)
ON CONFLICT (id1, id2)
DO UPDATE SET fielda = $fielda, fieldb = $fieldb
RETURNING *`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b',
            },
            returnOne: true,
        });
    });

    it(
    'should generate query for upserting using same order for (field...) and VALUES(field...)',
    () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableFields: ['field'],
        });
        assert.deepEqual(upsertOneQuery({ field: 'value', id: 1 }), {
            sql: (
`INSERT INTO table (id, field)
VALUES ($id, $field)
ON CONFLICT (id)
DO UPDATE SET field = $field
RETURNING *`
            ),
            parameters: {
                id: 1,
                field: 'value',
            },
            returnOne: true,
        });
    });

    it('should not try to update field not passed in entity', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableFields: ['fielda', 'fieldb'],
        });
        assert.deepEqual(upsertOneQuery({ fielda: 'value', id: 1 }), {
            sql: (
`INSERT INTO table (id, fielda)
VALUES ($id, $fielda)
ON CONFLICT (id)
DO UPDATE SET fielda = $fielda
RETURNING *`
            ),
            parameters: {
                id: 1,
                fielda: 'value',
            },
            returnOne: true,
        });
    });

    it('should DO NOTHING on conflict when no value provided to updatable field', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableFields: ['field'],
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

    it('should accept to have no writableFields', () => {
        const upsertOneQuery = upsertOneQuerier({
            table: 'table',
            primaryKey: ['id'],
            writableFields: [],
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
