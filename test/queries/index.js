import queries from '../../lib/queries';

describe('queries', function () {
    let configuredQueries;
    const table = 'table';
    const idFields = ['id1', 'id2'];
    const fields = ['field1', 'field2'];
    const returnFields = '*';

    before(function () {
        configuredQueries = queries(table, fields, idFields, returnFields);
    });

    it('should initialize all queries with given parameters', function () {
        assert.deepEqual(Object.keys(configuredQueries), [
            'deleteOne',
            'insertOne',
            'selectOne',
            'selectPage',
            'updateOne'
        ]);

    });

    it('should configure deleteOne', function () {
        const { deleteOne } = configuredQueries;
        assert.equal(deleteOne.table(), table);
        assert.deepEqual(deleteOne.idFields(), idFields);
        assert.equal(deleteOne.returnFields(), returnFields);
    });

    it('should configure insertOne', function () {
        const { insertOne } = configuredQueries;
        assert.equal(insertOne.table(), table);
        assert.deepEqual(insertOne.fields(), fields);
        assert.equal(insertOne.returnFields(), returnFields);
    });

    it('should configure selectOne', function () {
        const { selectOne } = configuredQueries;
        assert.equal(selectOne.table(), table);
        assert.deepEqual(selectOne.idFields(), idFields);
        assert.equal(selectOne.returnFields(), returnFields);
    });

    it('should configure selectPage', function () {
        const { selectPage } = configuredQueries;
        assert.equal(selectPage.table(), table);
        assert.deepEqual(selectPage.idFields(), idFields);
        assert.deepEqual(selectPage.fields(), fields);
    });

    it('should configure updateOne', function () {
        const { updateOne } = configuredQueries;
        assert.equal(updateOne.table(), table);
        assert.deepEqual(updateOne.idFields(), idFields);
        assert.deepEqual(updateOne.updatableFields(), fields);
        assert.equal(updateOne.returnFields(), returnFields);
    });

    describe('configurator', function () {
        it('should should receive queries object', function () {
            let configuredQueriesInConfigurator;
            const result = queries(table, fields, idFields, returnFields, [(q) => configuredQueriesInConfigurator = q]);
            assert.deepEqual(result, configuredQueriesInConfigurator);
        });

        it('should configure targeted query', function () {
            const result = queries(table, fields, idFields, returnFields, [({ selectPage }) => selectPage.table('other-table')]);
            assert.equal(result.selectPage.table(), 'other-table');
        });
    });
});
