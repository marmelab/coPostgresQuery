import deleteOneQuery from '../queries/deleteOne';
import insertOneQuery from '../queries/insertOne';
import selectOneQuery from '../queries/selectOne';
import selectPageQuery from '../queries/selectPage';
import updateOneQuery from '../queries/updateOne';
import batchInsertQuery from '../queries/batchInsert';
import batchDeleteQuery from '../queries/batchDelete';
import batchUpsertQuery from '../queries/batchUpsert';
import upsertOneQuery from '../queries/upsertOne';
import countAllQuery from '../queries/countAll';
import selectByOrderedFieldValuesQuery from '../queries/selectByOrderedFieldValues';

export default function (table, fields, idFields, returnFields = fields, configurators = []) {
    const deleteOne = deleteOneQuery(table, idFields);
    const insertOne = insertOneQuery(table, fields, returnFields);
    const selectOne = selectOneQuery(table, idFields, returnFields);
    const selectPage = selectPageQuery(table, idFields, returnFields);
    const updateOne = updateOneQuery(table, fields, idFields, returnFields);
    const batchInsert = batchInsertQuery(table, fields, returnFields);
    const batchDelete = batchDeleteQuery(table, fields, idFields);
    const countAll = countAllQuery(table, idFields[0]);

    const queries = {
        deleteOne,
        insertOne,
        selectOne,
        selectPage,
        updateOne,
        batchInsert,
        batchDelete,
        countAll,
    };

    [].concat(configurators).forEach(configure => configure(queries));

    return queries;
}

export const factories = {
    deleteOne: deleteOneQuery,
    insertOne: insertOneQuery,
    selectOne: selectOneQuery,
    selectPage: selectPageQuery,
    updateOne: updateOneQuery,
    batchInsert: batchInsertQuery,
    batchDelete: batchDeleteQuery,
    batchUpsert: batchUpsertQuery,
    upsertOne: upsertOneQuery,
    selectByOrderedFieldValues: selectByOrderedFieldValuesQuery,
    countall: countAllQuery,
};
