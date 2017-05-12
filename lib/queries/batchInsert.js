import valueSubQuery from './helpers/valueSubQuery';
import batchParameter from './helpers/batchParameter';
import returningQuery from './helpers/returningQuery';


export default ({ table, writableFields, returnFields }) => {
    const returning = returningQuery(returnFields);

    return (entities) => {
        if (!entities || entities.length === 0) {
            return { sql: '' };
        }

        const parameters = batchParameter(writableFields)(entities);
        const getValueSubQuery = valueSubQuery(writableFields);

        const values = entities
            .map((entity, index) => getValueSubQuery(index + 1))
            .reduce((result, sql) => result.concat(`(${sql})`), [])
            .join(', ');

        const sql = `INSERT INTO ${table}(${writableFields.join(', ')}) VALUES ${values} ${returning};`;

        return { sql, parameters };
    };
};
