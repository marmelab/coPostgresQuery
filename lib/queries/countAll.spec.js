import { assert } from 'chai';

import countAllQuerier from '../../lib/queries/countAll';

describe('QUERY countAll', () => {
    it('should generate sql to count all row', () => {
        const countAllQuery = countAllQuerier({ table: 'table' });
        assert.deepEqual(countAllQuery(), {
            sql: 'SELECT COUNT(*) FROM table;',
            returnOne: true,
        });
    });

    it('should generate sql to count all row by applying permanent filters', () => {
        const countAllQuery = countAllQuerier({
            table: 'table',
            permanentFilters: {
                column1: 'foo',
                column2: 'bar',
            },
        });
        assert.deepEqual(countAllQuery(), {
            sql: 'SELECT COUNT(*) FROM table WHERE column1 = $column1 AND column2 = $column2;',
            parameters: {
                column1: 'foo',
                column2: 'bar',
            },
            returnOne: true,
        });
    });
});
