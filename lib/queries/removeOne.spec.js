import { assert } from 'chai';

import removeOne from './removeOne';

describe('QUERY removeOne', () => {
    it('should generate sql and parameter for selecting one row', () => {
        const removeOneQuery = removeOne({
            table: 'table',
            primaryKey: ['id1', 'id2'],
            returnFields: ['fielda', 'fieldb'],
            returnOne: true,
        });
        assert.deepEqual(removeOneQuery({ id1: 1, id2: 2 }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING fielda, fieldb',
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
        });
    });

    it('should ignore parameters not in selectors', () => {
        const removeOneQuery = removeOne({ table: 'table', primaryKey: ['id1', 'id2'], returnFields: ['*'] });
        assert.deepEqual(removeOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING *',
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
        });
    });
});
