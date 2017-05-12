import valueSubQuery from './helpers/valueSubQuery';
import batchParameter from './helpers/batchParameter';
import returningQuery from './helpers/returningQuery';


export default ({ table, writableFields, returnFields }) => {
    const returning = returningQuery(returnFields);

    return (rows) => {
        if (!rows || rows.length === 0) {
            return { sql: '' };
        }

        const parameters = batchParameter(writableFields)(rows);
        const getValueSubQuery = valueSubQuery(writableFields);

        const values = rows
            .map((row, index) => getValueSubQuery(index + 1))
            .reduce((result, sql) => result.concat(`(${sql})`), [])
            .join(', ');

        const sql = `INSERT INTO ${table}(${writableFields.join(', ')}) VALUES ${values} ${returning};`;

        return { sql, parameters };
    };
};
