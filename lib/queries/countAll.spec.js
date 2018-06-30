import { assert } from 'chai';

import countAll from '../../lib/queries/countAll';

describe('QUERY countAll', () => {
    it('should generate SQL to count all rows if no filter is given', () => {
        const countQuery = countAll({ table: 'table' });

        assert.deepEqual(countQuery(), {
            returnOne: true,
            sql: 'SELECT COUNT(*) FROM table;',
        });
    });

    it('should generate SQL to count all row by applying permanent filters', () => {
        const countAllQuery = countAll({
            permanentFilters: {
                column1: 'foo',
                column2: 'bar',
            },
            table: 'table',
        });

        assert.deepEqual(countAllQuery(), {
            parameters: {
                column1: 'foo',
                column2: 'bar',
            },
            returnOne: true,
            sql: 'SELECT COUNT(*) FROM table WHERE column1 = $column1 AND column2 = $column2;',
        });
    });

    it('should generate SQL query counting all records filtered by given filters', () => {
        const countQuery = countAll({ table: 'table' });

        assert.deepEqual(countQuery({ filters: { username: 'john.doe', department: 'HR' } }), {
            parameters: {
                department: 'HR',
                username: 'john.doe',
            },
            returnOne: true,
            sql: 'SELECT COUNT(*) FROM table WHERE username = $username AND department = $department;',
        });
    });

    it('should generate SQL query counting all records filtered by both given filters AND permanent ones', () => {
        const countQuery = countAll({
            permanentFilters: {
                department: 'HR',
            },
            table: 'table',
        });

        assert.deepEqual(countQuery({ filters: { username: 'john.doe' } }), {
            parameters: {
                department: 'HR',
                username: 'john.doe',
            },
            returnOne: true,
            sql: 'SELECT COUNT(*) FROM table WHERE department = $department AND username = $username;',
        });
    });
});
