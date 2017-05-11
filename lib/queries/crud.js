import removeOneQuery from '../queries/removeOne';
import insertOneQuery from '../queries/insertOne';
import selectOneQuery from '../queries/selectOne';
import selectQuery from '../queries/select';
import updateOneQuery from '../queries/updateOne';
import batchInsertQuery from '../queries/batchInsert';
import batchRemoveQuery from '../queries/batchRemove';
import countAllQuery from '../queries/countAll';

export default function ({
    table,
    fields,
    primaryKey = 'id',
    returnFields = fields,
    writableFields = fields,
    searchableFields,
    specificSorts,
    groupByFields,
    withQuery,
    allowPrimaryKeyUpdate,
}) {
    const removeOne = removeOneQuery({ table, primaryKey });
    const insertOne = insertOneQuery({ table, fields, returnFields });
    const selectOne = selectOneQuery({ table, primaryKey, returnFields });
    const select = selectQuery({ table, primaryKey, returnFields, searchableFields, specificSorts, groupByFields, withQuery });
    const updateOne = updateOneQuery({ table, writableFields, primaryKey, returnFields, allowPrimaryKeyUpdate });
    const batchInsert = batchInsertQuery({ table, fields, returnFields });
    const batchRemove = batchRemoveQuery({ table, returnFields, primaryKey });
    const countAll = countAllQuery({ table });

    const queries = {
        removeOne,
        insertOne,
        selectOne,
        select,
        updateOne,
        batchInsert,
        batchRemove,
        countAll,
    };

    return queries;
}
