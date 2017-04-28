import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';

export default ({ table, fields, returnFields = ['*'] }) => (entities) => {
    if (!entities || entities.length === 0) {
        return { sql: '' };
    }

    const parameters = batchParameter(fields)(entities);
    const getValueSubQuery = valueSubQuery(fields);

    const returning = returnFields.join(', ');

    const values = entities
        .map((entity, index) => getValueSubQuery(index + 1))
        .reduce((result, sql) => result.concat(`(${sql})`), [])
        .join(', ');

    const sql = `INSERT INTO ${table}(${fields.join(', ')}) VALUES ${values} RETURNING ${returning};`;

    return { sql, parameters };
};
