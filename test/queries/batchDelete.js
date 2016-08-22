import batchDeleteQuerier from '../../lib/queries/batchDelete';

describe('QUERY batchDelete', () => {
    it('should generate sql and parameter to batchDelete given single ids', () => {
        const batchDeleteQuery = batchDeleteQuerier('table', ['fielda', 'fieldb'], 'id');
        assert.deepEqual(batchDeleteQuery([1, 2]), {
            sql: 'DELETE FROM table WHERE id IN ($id1, $id2) RETURNING fielda, fieldb;',
            parameters: {
                id1: 1,
                id2: 2,
            },
        });
    });

    it('should generate sql and parameter to batchDelete given multikey ids', () => {
        const batchDeleteQuery = batchDeleteQuerier('table', ['fielda', 'fieldb'], ['id1', 'id2']);
        assert.deepEqual(batchDeleteQuery([{ id1: 1, id2: 2 }, { id1: 3, id2: 4 }]), {
            sql: 'DELETE FROM table WHERE id1 IN ($id11, $id12) AND id2 IN ($id21, $id22) RETURNING fielda, fieldb;',
            parameters: {
                id11: 1,
                id21: 2,
                id12: 3,
                id22: 4,
            },
        });
    });
});
