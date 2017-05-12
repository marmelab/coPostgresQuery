import { assert } from 'chai';

import updateOneQuerier from './updateOne';

describe('QUERY updateOne', () => {
    it('shoul generate sql and parameter for updating one row', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: ['id'],
        });
        assert.deepEqual(updateOneQuery(1, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE id = $id
RETURNING *`
            ),
            parameters: {
                id: 1,
                fielda_u: 1,
                fieldb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should accept a single value as primaryKey', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: 'uid',
        });
        assert.deepEqual(updateOneQuery(1, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE uid = $uid
RETURNING *`
            ),
            parameters: {
                uid: 1,
                fielda_u: 1,
                fieldb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should accept multiple id', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: ['id', 'uid'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                fielda_u: 1,
                fieldb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should ignore selector not in selectorFields', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: ['id'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE id = $id
RETURNING *`
            ),
            parameters: {
                id: 1,
                fielda_u: 1,
                fieldb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should throw an error if given idFieldNames does not match ids', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: ['uid', 'id'],
        });
        assert.throw(
            () => updateOneQuery({ id: 1 }, { fielda: 1, fieldb: 2 }),
            'Given object: (id) does not match keys: (uid, id)'
        );
    });

    it('should not update field that have no value', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: ['id', 'uid'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { fielda: 1 }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                fielda_u: 1,
            },
            returnOne: true,
        });
    });

    it('should allow to set value to null', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableFields: ['fielda', 'fieldb'],
            primaryKey: ['id', 'uid'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { fielda: 1, fieldb: null }), {
            sql: (
`UPDATE table
SET fielda=$fielda_u, fieldb=$fieldb_u
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                fielda_u: 1,
                fieldb_u: null,
            },
            returnOne: true,
        });
    });
});
