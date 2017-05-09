import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';
import returningQuery from './returningQuery';


export default ({ table, fields, returnFields }) => {
    const returning = returningQuery(returnFields);

    return (entities) => {
        if (!entities || entities.length === 0) {
            return { sql: '' };
        }

        const parameters = batchParameter(fields)(entities);
        const getValueSubQuery = valueSubQuery(fields);

        const values = entities
            .map((entity, index) => getValueSubQuery(index + 1))
            .reduce((result, sql) => result.concat(`(${sql})`), [])
            .join(', ');

        const sql = `INSERT INTO ${table}(${fields.join(', ')}) VALUES ${values} ${returning};`;

        return { sql, parameters };
    };
};
