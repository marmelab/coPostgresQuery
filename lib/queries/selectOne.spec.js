import { assert } from 'chai';

import selectOneQuerier from '../../lib/queries/selectOne';

describe('QUERY selectOne', () => {
    it('should generate sql and parameter for selecting one entity', () => {
        const selectOneQuery = selectOneQuerier({
            table: 'table',
            primaryKey: ['id1', 'id2'],
            returnFields: ['fielda', 'fieldb'],
        });
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2 }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
        });
    });

    it('should generate sql and params to select one entity when receiving single value', () => {
        const selectOneQuery = selectOneQuerier({
            table: 'bib_user',
            primaryKey: 'username',
            returnFields: ['*'],
        });
        assert.deepEqual(selectOneQuery('john'), {
            sql: 'SELECT * FROM bib_user WHERE username = $username LIMIT 1',
            parameters: {
                username: 'john',
            },
            returnOne: true,
        });
    });

    it('should ignore parameters not in primaryKey', () => {
        const selectOneQuery = selectOneQuerier({
            table: 'table',
            primaryKey: ['id1', 'id2'],
            returnFields: ['fielda', 'fieldb'],
        });
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
        });
    });
});
