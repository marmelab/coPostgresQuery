import { default as deleteOneQuery } from '../queries/deleteOne';
import { default as insertOneQuery } from '../queries/insertOne';
import { default as selectOneQuery } from '../queries/selectOne';
import { default as selectPageQuery } from '../queries/selectPage';
import { default as updateOneQuery } from '../queries/updateOne';
import { default as batchInsertQuery } from '../queries/batchInsert';
import { default as batchDeleteQuery } from '../queries/batchDelete';

export default function (table, fields, idFields, returnFields = ['*'], configurators = []) {
    const deleteOne = deleteOneQuery(table, idFields);
    const insertOne = insertOneQuery(table, fields);
    const selectOne = selectOneQuery(table, idFields, returnFields);
    const selectPage = selectPageQuery(table, fields, idFields);
    const updateOne = updateOneQuery(table, fields, idFields);
    const batchInsert = batchInsertQuery(table, fields, returnFields);
    const batchDelete = batchDeleteQuery(table, fields, idFields);

    const queries = {
        deleteOne,
        insertOne,
        selectOne,
        selectPage,
        updateOne,
        batchInsert,
        batchDelete
    };

    [].concat(configurators).forEach(configure => configure(queries));

    return queries;
};
