import { assert } from 'chai';

import remove from './remove';

describe('QUERY remove', () => {
    it('should generate sql and parameter for selecting one row', () => {
        const removeQuery = remove({
            table: 'table',
            filterCols: ['columnA', 'columnB', 'columnC', 'columnD'],
            returnCols: ['id'],
        });
        assert.deepEqual(removeQuery({ columnA: 'foo', columnC: 'bar' }), {
            sql: 'DELETE FROM table WHERE columnA = $columnA AND columnC = $columnC RETURNING id',
            parameters: {
                columnA: 'foo',
                columnC: 'bar',
            },
            returnOne: false,
        });
    });

    it('should apply permanent filters', () => {
        const removeQuery = remove({
            table: 'table',
            filterCols: ['columnA', 'columnB', 'columnC'],
            returnCols: ['id'],
            permanentFilters: { columnD: 'thisIsIt' },
        });
        assert.deepEqual(removeQuery({ columnA: 'foo', columnB: 'bar' }), {
            sql: 'DELETE FROM table WHERE columnA = $columnA AND columnB = $columnB AND columnD = $columnD RETURNING id',
            parameters: {
                columnA: 'foo',
                columnB: 'bar',
                columnD: 'thisIsIt',
            },
            returnOne: false,
        });
    });
});
