import whereQuery from './helpers/whereQuery';
import sanitizeParameter from './helpers/sanitizeParameter';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import returningQuery from './helpers/returningQuery';
import addSuffix from '../utils/addSuffix';

export default ({
    table,
    writableCols,
    filterCols: selectors,
    returnCols,
    permanentFilters = {},
}, _one = false) => {
    const filterCols = [
        ...[].concat(selectors),
        ...Object.keys(permanentFilters),
    ];
    const returning = returningQuery(returnCols);

    return (filter, data) => {
        // with updateOne query builder the primaryKey is add to the first entry of the filterCols
        const upgradedFilters = {
            ...typeof filter === 'object' ? filter : { [selectors[0]]: filter },
            ...permanentFilters,
        };
        const filters = _one
            ? sanitizeIdentifier(filterCols, upgradedFilters)
            : sanitizeParameter(filterCols, upgradedFilters);
        const updateParameters = sanitizeParameter(writableCols, data);
        const parameters = {
            ...filters,
            ...addSuffix(updateParameters, '_u'),
        };

        const where = whereQuery(filters, filterCols);

        const setQuery = writableCols
            .filter(column => typeof updateParameters[column] !== 'undefined')
            .reduce((result, column) => ([
                ...result,
                `${column}=$${column}_u`,
            ]), []);

        if (Object.keys(parameters).length === 1) {
            throw new Error('no valid column to set');
        }

        const sql = (
`UPDATE ${table}
SET ${setQuery.join(', ')}
${where}
${returning}`
        );

        return {
            sql,
            parameters,
            returnOne: _one,
        };
    };
};
