import { assert } from 'chai';

import updateOneQuerier from './updateOne';

describe('QUERY updateOne', () => {
    it('shoul generate sql and parameter for updating one row', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['id'],
        });
        assert.deepEqual(updateOneQuery(1, { columna: 1, columnb: 2 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id
RETURNING *`
            ),
            parameters: {
                id: 1,
                columna_u: 1,
                columnb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should accept a single value as primaryKey', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: 'uid',
        });
        assert.deepEqual(updateOneQuery(1, { columna: 1, columnb: 2 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE uid = $uid
RETURNING *`
            ),
            parameters: {
                uid: 1,
                columna_u: 1,
                columnb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should accept multiple id', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['id', 'uid'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: 2 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                columna_u: 1,
                columnb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should ignore identifier not in primaryKey', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['id'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: 2 }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id
RETURNING *`
            ),
            parameters: {
                id: 1,
                columna_u: 1,
                columnb_u: 2,
            },
            returnOne: true,
        });
    });

    it('should throw an error if given identifier does not match primaryKey', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['uid', 'id'],
        });
        assert.throw(
            () => updateOneQuery({ id: 1 }, { columna: 1, columnb: 2 }),
            'Given object: (id) does not match keys: (uid, id)'
        );
    });

    it('should not update column that have no value', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['id', 'uid'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { columna: 1 }), {
            sql: (
`UPDATE table
SET columna=$columna_u
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                columna_u: 1,
            },
            returnOne: true,
        });
    });

    it('should allow to set value to null', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['id', 'uid'],
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: null }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                columna_u: 1,
                columnb_u: null,
            },
            returnOne: true,
        });
    });

    it('should apply permanent filters', () => {
        const updateOneQuery = updateOneQuerier({
            table: 'table',
            writableCols: ['columna', 'columnb'],
            primaryKey: ['id', 'uid'],
            permanentFilters: { columnc: 'foo', columnd: 'bar' },
        });
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { columna: 1, columnb: null }), {
            sql: (
`UPDATE table
SET columna=$columna_u, columnb=$columnb_u
WHERE id = $id AND uid = $uid AND columnc = $columnc AND columnd = $columnd
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                columna_u: 1,
                columnb_u: null,
                columnc: 'foo',
                columnd: 'bar',
            },
            returnOne: true,
        });
    });
});
