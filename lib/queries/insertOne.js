import valueSubQuery from './helpers/valueSubQuery';
import sanitizeParameter from './helpers/sanitizeParameter';
import returningQuery from './helpers/returningQuery';

export default ({ table, writableCols, returnCols }) => {
    const returning = returningQuery(returnCols);

    return (data) => {
        const parameters = sanitizeParameter(writableCols, data);
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
