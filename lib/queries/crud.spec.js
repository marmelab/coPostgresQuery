import { assert } from 'chai';

import crudQueries from './crud';

describe('crud', () => {
    let crud;
    const table = 'table';
    const idFields = ['id1', 'id2'];
    const fields = ['field1', 'field2'];
    const returnFields = ['*'];

    before(() => {
        crud = crudQueries({ table, fields, idFields, returnFields });
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
});
