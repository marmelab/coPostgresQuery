import crudQueries from '../../lib/queries/crud';

describe('crud', () => {
    let crud;
    const table = 'table';
    const idFields = ['id1', 'id2'];
    const fields = ['field1', 'field2'];
    const returnFields = ['*'];

    before(() => {
        crud = crudQueries(table, fields, idFields, returnFields);
    });

    it('should initialize all queries with given parameters', () => {
        assert.deepEqual(Object.keys(crud), [
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
        const { deleteOne } = crud;
        assert.equal(deleteOne.table(), table);
        assert.deepEqual(deleteOne.idFields(), idFields);
        assert.deepEqual(deleteOne.returnFields(), returnFields);
    });

    it('should configure insertOne', () => {
        const { insertOne } = crud;
        assert.equal(insertOne.table(), table);
        assert.deepEqual(insertOne.fields(), fields);
        assert.deepEqual(insertOne.returnFields(), returnFields);
    });

    it('should configure selectOne', () => {
        const { selectOne } = crud;
        assert.equal(selectOne.table(), table);
        assert.deepEqual(selectOne.idFields(), idFields);
        assert.deepEqual(selectOne.returnFields(), returnFields);
    });

    it('should configure selectPage', () => {
        const { selectPage } = crud;
        assert.equal(selectPage.table(), table);
        assert.deepEqual(selectPage.idFields(), idFields);
        assert.deepEqual(selectPage.returnFields(), returnFields);
    });

    it('should configure updateOne', () => {
        const { updateOne } = crud;
        assert.equal(updateOne.table(), table);
        assert.deepEqual(updateOne.idFields(), idFields);
        assert.deepEqual(updateOne.updatableFields(), fields);
        assert.deepEqual(updateOne.returnFields(), returnFields);
    });

    it('should configure batchInsert', () => {
        const { batchInsert } = crud;
        assert.equal(batchInsert.table(), table);
        assert.deepEqual(batchInsert.fields(), fields);
        assert.deepEqual(batchInsert.returnFields(), returnFields);
    });

    it('should configure batchDelete', () => {
        const { batchDelete } = crud;
        assert.equal(batchDelete.table(), table);
        assert.deepEqual(batchDelete.fields(), fields);
        assert.equal(batchDelete.idFields(), idFields);
    });
});
