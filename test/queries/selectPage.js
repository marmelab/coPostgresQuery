import selectPage from '../../lib/queries/selectPage';

describe('selectPage', function () {

    it('should use a simple query if querying on a single table', function* () {
        const { sql, parameters } = selectPage('table', ['id'], ['field1', 'field2'])();

        assert.equal(sql, 'SELECT field1, field2, COUNT(*) OVER() as totalCount FROM table ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });

    it('should use a "WITH result AS" query if querying on a joined table', function* () {
        const { sql, parameters } = selectPage('table1 JOIN table2 ON table1.table2_id table2.id', ['id'], ['field1', 'field2'])();

        assert.equal(sql, 'WITH result AS (SELECT field1, field2, COUNT(*) OVER() as totalCount FROM table1 JOIN table2 ON table1.table2_id table2.id) SELECT * FROM result ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });

    it('should use a "WITH result AS" query if enabling the withQuery extraOptions', function* () {
        const { sql, parameters } = selectPage('table1 JOIN table2 ON table1.table2_id table2.id', ['id'], ['field1', 'field2'])
        .withQuery(true)();

        assert.equal(sql, 'WITH result AS (SELECT field1, field2, COUNT(*) OVER() as totalCount FROM table1 JOIN table2 ON table1.table2_id table2.id) SELECT * FROM result ORDER BY id ASC');
        assert.deepEqual(parameters, {});
    });
});
