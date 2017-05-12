import valueSubQuery from './helpers/valueSubQuery';
import sanitizeParameter from './helpers/sanitizeParameter';
import returningQuery from './helpers/returningQuery';

export default ({ table, writableFields, returnFields }) => {
    const returning = returningQuery(returnFields);

    return (data) => {
        const parameters = sanitizeParameter(writableFields, data);
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
