import { assert } from 'chai';

import select from './select';

describe('select', () => {
    it('should use a simple query if querying on a single table', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
        })();

        assert.equal(sql, 'SELECT column1, column2 FROM table  ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });

    it('should add a group by clause if at least on groupByCols is given', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            groupByCols: ['column1', 'column2'],
        })();

        assert.equal(sql, 'SELECT column1, column2 FROM table  GROUP BY column1, column2 ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });

    it('should use a "WITH result AS" query if querying on a joined table', () => {
        const { sql, parameters } = select({
            table: 'table1 JOIN table2 ON table1.table2_id table2.id',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
        })();

        assert.equal(sql, (
`WITH result AS (
SELECT column1, column2 FROM table1 JOIN table2 ON table1.table2_id table2.id
) SELECT * FROM result ORDER BY id ASC`
));
        assert.deepEqual(parameters, {});
    });

    it('should use a "WITH result AS" query if enabling the withQuery extraOptions', () => {
        const { sql, parameters } = select({
            table: 'table1 JOIN table2 ON table1.table2_id table2.id',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            withQuery: true,
        })();

        assert.equal(sql, (
`WITH result AS (
SELECT column1, column2 FROM table1 JOIN table2 ON table1.table2_id table2.id
) SELECT * FROM result ORDER BY id ASC`
        ));
        assert.deepEqual(parameters, {});
    });

    it('should use filters in WHERE query', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
        })({ filters: { column1: 'value', column2: 'other value' } });

        assert.equal(sql, 'SELECT column1, column2 FROM table WHERE column1 = $column1 AND column2 = $column2 ORDER BY id ASC');
        assert.deepEqual(parameters, {
            column1: 'value',
            column2: 'other value',
        });
    });

    it('should use IN query when receiving an array of value as a filter parameter', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
        })({ filters: { column1: ['value', 'other value'] } });

        assert.equal(sql, 'SELECT column1, column2 FROM table WHERE column1 IN ($column11, $column12) ORDER BY id ASC');
        assert.deepEqual(parameters, {
            column11: 'value',
            column12: 'other value',
        });
    });

    it('should limit and skip if given corresponding parameter', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
        })({ limit: 50, offset: 100 });

        assert.equal(sql, 'SELECT column1, column2 FROM table  ORDER BY id ASC LIMIT $limit OFFSET $offset');
        assert.deepEqual(parameters, { limit: 50, offset: 100 });
    });

    it('should sort using sort and sortDir', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
        })({ sort: 'column2', sortDir: 'DESC' });

        assert.equal(sql, 'SELECT column1, column2 FROM table  ORDER BY $sort DESC, id ASC');
        assert.deepEqual(parameters, { sort: 'column2' });
    });

    it('should use specificsort if it is set and used', () => {
        const { sql, parameters } = select({
            table: 'table',
            primaryKey: ['id'],
            returnCols: ['column1', 'column2'],
            specificSorts: { level: ['master', 'expert', 'novice'] },
        })({ sort: 'level', sortDir: 'DESC' });

        assert.equal(sql, 'SELECT column1, column2 FROM table  ORDER BY CASE $sort WHEN \'master\' THEN 1 WHEN \'expert\' THEN 2 WHEN \'novice\' THEN 3 END  DESC, id ASC');
        assert.deepEqual(parameters, { sort: 'level' });
    });
});