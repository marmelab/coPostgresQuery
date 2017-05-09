import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';
import returningQuery from './returningQuery';

export default ({ table, fields, returnFields }) => {
    const returning = returningQuery(returnFields);

    return (data) => {
        const parameters = sanitizeParameter(fields, data);
        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');
        const sql = (
`INSERT INTO ${table}
(${keys.join(', ')})
VALUES(${values})
${returning}`
        );

        return {
            sql,
            parameters,
            returnOne: true,
        };
    };
};
