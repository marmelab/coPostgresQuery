import valueSubQuery from './helpers/valueSubQuery';
import batchParameter from './helpers/batchParameter';
import returningQuery from './helpers/returningQuery';


export default ({ table, writableCols, returnCols }) => {
    const returning = returningQuery(returnCols);

    return (rows) => {
        if (!rows || rows.length === 0) {
            return { sql: '' };
        }

        const parameters = batchParameter(writableCols)(rows);
        const getValueSubQuery = valueSubQuery(writableCols);

        const values = rows
            .map((row, index) => getValueSubQuery(index + 1))
            .reduce((result, sql) => result.concat(`(${sql})`), [])
            .join(', ');

        const sql = `INSERT INTO ${table}(${writableCols.join(', ')}) VALUES ${values} ${returning};`;

        return { sql, parameters };
    };
};
