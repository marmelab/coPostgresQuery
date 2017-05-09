import { assert } from 'chai';

import selectPage from './selectPage';

describe('selectPage', () => {
    it('should use a simple query if querying on a single table', () => {
        const { sql, parameters } = selectPage({
            table: 'table',
            idFields: ['id'],
            returnFields: ['field1', 'field2'],
        })();

        assert.equal(sql, 'SELECT field1, field2 FROM table  ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });

    it('should add a group by clause if at least on groupByFields is given', () => {
        const { sql, parameters } = selectPage({
            table: 'table',
            idFields: ['id'],
            returnFields: ['field1', 'field2'],
            groupByFields: ['field1', 'field2'],
        })();

        assert.equal(sql, 'SELECT field1, field2 FROM table  GROUP BY field1, field2 ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });

    it('should use a "WITH result AS" query if querying on a joined table', () => {
        const { sql, parameters } = selectPage({
            table: 'table1 JOIN table2 ON table1.table2_id table2.id',
            idFields: ['id'],
            returnFields: ['field1', 'field2'],
        })();

        assert.equal(sql, (
`WITH result AS (
SELECT field1, field2 FROM table1 JOIN table2 ON table1.table2_id table2.id
) SELECT * FROM result ORDER BY id ASC`
));
        assert.deepEqual(parameters, {});
    });

    it('should use a "WITH result AS" query if enabling the withQuery extraOptions', () => {
        const { sql, parameters } = selectPage({
            table: 'table1 JOIN table2 ON table1.table2_id table2.id',
            idFields: ['id'],
            returnFields: ['field1', 'field2'],
            withQuery: true,
        })();

        assert.equal(sql, (
`WITH result AS (
SELECT field1, field2 FROM table1 JOIN table2 ON table1.table2_id table2.id
) SELECT * FROM result ORDER BY id ASC`
        ));
        assert.deepEqual(parameters, {});
    });

    it('should use IN query when receiving an array of value as a parameter', () => {
        const { sql, parameters } = selectPage({
            table: 'table',
            idFields: ['id'],
            returnFields: ['field1', 'field2'],
        })(null, null, { field1: ['value', 'other value'] });

        assert.equal(sql, 'SELECT field1, field2 FROM table WHERE field1 IN ($field11, $field12) ORDER BY id ASC');
        assert.deepEqual(parameters, {
            field11: 'value',
            field12: 'other value',
        });
    });
});
