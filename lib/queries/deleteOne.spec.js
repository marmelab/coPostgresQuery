import { assert } from 'chai';

import deleteOne from './deleteOne';

describe('QUERY deleteOne', () => {
    it('should generate sql and parameter for selecting one entity', () => {
        const deleteOneQuery = deleteOne({
            table: 'table',
            idFields: ['id1', 'id2'],
            returnFields: ['fielda', 'fieldb'],
            returnOne: true,
        });
        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2 }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING fielda, fieldb',
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
        });
    });

    it('should ignore parameters not in selectors', () => {
        const deleteOneQuery = deleteOne({ table: 'table', idFields: ['id1', 'id2'], returnFields: ['*'] });
        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING *',
            parameters: {
                id1: 1,
                id2: 2,
            },
            returnOne: true,
        });
    });
});
