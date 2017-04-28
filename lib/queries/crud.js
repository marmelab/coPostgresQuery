import deleteOneQuery from '../queries/deleteOne';
import insertOneQuery from '../queries/insertOne';
import selectOneQuery from '../queries/selectOne';
import selectPageQuery from '../queries/selectPage';
import updateOneQuery from '../queries/updateOne';
import batchInsertQuery from '../queries/batchInsert';
import batchDeleteQuery from '../queries/batchDelete';
import countAllQuery from '../queries/countAll';

export default function ({ table, fields, idFields, returnFields = fields }) {
    const deleteOne = deleteOneQuery({ table, idFields });
    const insertOne = insertOneQuery({ table, fields, returnFields });
    const selectOne = selectOneQuery({ table, idFields, returnFields });
    const selectPage = selectPageQuery({ table, idFields, returnFields });
    const updateOne = updateOneQuery(table, fields, idFields, returnFields);
    const batchInsert = batchInsertQuery({ table, fields, returnFields });
    const batchDelete = batchDeleteQuery({ table, fields, idFields });
    const countAll = countAllQuery({ table });

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

    return queries;
}
