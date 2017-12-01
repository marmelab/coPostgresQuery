import { assert } from 'chai';

import batchRemoveQuerier from './batchRemove';

describe('QUERY batchRemove', () => {
    it('should generate sql and parameter to batchRemove given single ids', () => {
        const batchRemoveQuery = batchRemoveQuerier({
            table: 'table',
            returnCols: ['columna', 'columnb'],
            primaryKey: 'id',
        });
        assert.deepEqual(batchRemoveQuery([1, 2]), {
            sql: 'DELETE FROM table WHERE id IN ($id1, $id2) RETURNING columna, columnb;',
            parameters: {
                id1: 1,
                id2: 2,
            },
        });
    });

    it('should generate sql and parameter to batchRemove given multikey ids', () => {
        const batchRemoveQuery = batchRemoveQuerier({
            table: 'table',
            returnCols: ['columna', 'columnb'],
            primaryKey: ['id1', 'id2'],
        });
        assert.deepEqual(batchRemoveQuery([{ id1: 1, id2: 2 }, { id1: 3, id2: 4 }]), {
            sql: 'DELETE FROM table WHERE id1 IN ($id11, $id12) AND id2 IN ($id21, $id22) RETURNING columna, columnb;',
            parameters: {
                id11: 1,
                id21: 2,
                id12: 3,
                id22: 4,
            },
        });
    });

    it('should apply permanent filters', () => {
        const batchRemoveQuery = batchRemoveQuerier({
            table: 'table',
            returnCols: ['columna', 'columnb'],
            primaryKey: ['id1', 'id2'],
            permanentFilters: { columnc: 'foo' },
        });
        assert.deepEqual(batchRemoveQuery([{ id1: 1, id2: 2 }, { id1: 3, id2: 4 }]), {
            sql: 'DELETE FROM table WHERE id1 IN ($id11, $id12) AND id2 IN ($id21, $id22) AND columnc = $columnc RETURNING columna, columnb;',
            parameters: {
                id11: 1,
                id21: 2,
                id12: 3,
                id22: 4,
                columnc: 'foo',
            },
        });
    });
});
