import valueSubQuery from './helpers/valueSubQuery';
import sanitizeParameter from './helpers/sanitizeParameter';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import returningQuery from './helpers/returningQuery';
import whereQuery from './helpers/whereQuery';

export default ({
    table,
    primaryKey: idCols = 'id',
    writableCols,
    returnCols,
    permanentFilters = {},
}) => {
    const returning = returningQuery(returnCols);
    const primaryKey = [].concat(idCols);

    return (row) => {
        const parameters = {
            ...sanitizeIdentifier(primaryKey, row),
            ...sanitizeParameter(writableCols, row),
        };

        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const setQuery = writableCols
            .filter(column => typeof parameters[column] !== 'undefined')
            .map(column => `${column} = $${column}`);

        const permanentFiltersKeys = Object.keys(permanentFilters);
        let where = '';
        let permanentParameters = {};
        if (permanentFiltersKeys.length) {
            permanentParameters = sanitizeIdentifier(permanentFiltersKeys, permanentFilters);
            where = ` ${whereQuery(permanentParameters, permanentFiltersKeys)}`;
        }

        const sql = (
`INSERT INTO ${table} (${keys.join(', ')})
VALUES (${values})
ON CONFLICT (${primaryKey.join(', ')})
${
setQuery.length > 0 ? (
    `DO UPDATE SET ${setQuery.join(', ')}${where}`
) : (
    'DO NOTHING'
)
}
${returning}`
        );

        return {
            sql,
            parameters: {
                ...parameters,
                ...permanentParameters,
            },
            returnOne: true,
        };
    };
};
