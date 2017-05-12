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
});
