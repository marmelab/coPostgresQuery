import queries from '../../lib/queries';

describe('queries', () => {
    let configuredQueries;
    const table = 'table';
    const idFields = ['id1', 'id2'];
    const fields = ['field1', 'field2'];
    const returnFields = ['*'];

    before(() => {
        configuredQueries = queries(table, fields, idFields, returnFields);
    });

    it('should initialize all queries with given parameters', () => {
        assert.deepEqual(Object.keys(configuredQueries), [
            'deleteOne',
            'insertOne',
            'selectOne',
            'selectPage',
            'updateOne',
            'batchInsert',
            'batchDelete',
            'countAll',
        ]);
    });

    it('should configure deleteOne', () => {
        const { deleteOne } = configuredQueries;
        assert.equal(deleteOne.table(), table);
        assert.deepEqual(deleteOne.idFields(), idFields);
        assert.deepEqual(deleteOne.returnFields(), returnFields);
    });

    it('should configure insertOne', () => {
        const { insertOne } = configuredQueries;
        assert.equal(insertOne.table(), table);
        assert.deepEqual(insertOne.fields(), fields);
        assert.deepEqual(insertOne.returnFields(), returnFields);
    });

    it('should configure selectOne', () => {
        const { selectOne } = configuredQueries;
        assert.equal(selectOne.table(), table);
        assert.deepEqual(selectOne.idFields(), idFields);
        assert.deepEqual(selectOne.returnFields(), returnFields);
    });

    it('should configure selectPage', () => {
        const { selectPage } = configuredQueries;
        assert.equal(selectPage.table(), table);
        assert.deepEqual(selectPage.idFields(), idFields);
        assert.deepEqual(selectPage.returnFields(), returnFields);
    });

    it('should configure updateOne', () => {
        const { updateOne } = configuredQueries;
        assert.equal(updateOne.table(), table);
        assert.deepEqual(updateOne.idFields(), idFields);
        assert.deepEqual(updateOne.updatableFields(), fields);
        assert.deepEqual(updateOne.returnFields(), returnFields);
    });

    it('should configure batchInsert', () => {
        const { batchInsert } = configuredQueries;
        assert.equal(batchInsert.table(), table);
        assert.deepEqual(batchInsert.fields(), fields);
        assert.deepEqual(batchInsert.returnFields(), returnFields);
    });

    it('should configure batchDelete', () => {
        const { batchDelete } = configuredQueries;
        assert.equal(batchDelete.table(), table);
        assert.deepEqual(batchDelete.fields(), fields);
        assert.equal(batchDelete.identifier(), idFields);
    });

    describe('configurator', () => {
        it('should should receive queries object', () => {
            let configuredQueriesInConfigurator;
            const result = queries(table, fields, idFields, returnFields, [
                (q) => { configuredQueriesInConfigurator = q; },
            ]);
            assert.deepEqual(result, configuredQueriesInConfigurator);
        });

        it('should configure targeted query', () => {
            const result = queries(table, fields, idFields, returnFields, [
                ({ selectPage }) => selectPage.table('other-table'),
            ]);
            assert.equal(result.selectPage.table(), 'other-table');
        });
    });
});
