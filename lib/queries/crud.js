import removeOneQuery from '../queries/removeOne';
import insertOneQuery from '../queries/insertOne';
import selectOneQuery from '../queries/selectOne';
import selectPageQuery from '../queries/selectPage';
import updateOneQuery from '../queries/updateOne';
import batchInsertQuery from '../queries/batchInsert';
import batchRemoveQuery from '../queries/batchRemove';
import countAllQuery from '../queries/countAll';

export default function ({
    table,
    fields,
    idFields = ['id'],
    returnFields = fields,
    updatableFields = fields,
    searchableFields,
    specificSorts,
    groupByFields,
    withQuery,
    allowPrimaryKeyUpdate,
}) {
    const removeOne = removeOneQuery({ table, primaryKey: idFields });
    const insertOne = insertOneQuery({ table, fields, returnFields });
    const selectOne = selectOneQuery({ table, idFields, returnFields });
    const selectPage = selectPageQuery({ table, idFields, returnFields, searchableFields, specificSorts, groupByFields, withQuery });
    const updateOne = updateOneQuery({ table, updatableFields, primaryKey: idFields, returnFields, allowPrimaryKeyUpdate });
    const batchInsert = batchInsertQuery({ table, fields, returnFields });
    const batchRemove = batchRemoveQuery({ table, returnFields, idFields });
    const countAll = countAllQuery({ table });

    const queries = {
        removeOne,
        insertOne,
        selectOne,
        selectPage,
        updateOne,
        batchInsert,
        batchRemove,
        countAll,
    };

    return queries;
}
