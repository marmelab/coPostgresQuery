import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

export default ({ table, fields, returnFields = ['*'] }) => (data) => {
    const parameters = sanitizeParameter(fields, data);
    const keys = Object.keys(parameters);
    const values = valueSubQuery(keys, '');
    const sql = (
`INSERT INTO ${table}
(${keys.join(', ')})
VALUES(${values})
RETURNING ${returnFields.join(', ')}`
    );

    return {
        sql,
        parameters,
        returnOne: true,
    };
};
