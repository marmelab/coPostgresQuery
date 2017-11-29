import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import sanitizeParameter from './helpers/sanitizeParameter';
import whereQuery from './helpers/whereQuery';
import returningQuery from './helpers/returningQuery';

export default ({ table, filterCols, returnCols, permanentFilters = {} }, _one = false) => {
    const returning = returningQuery(returnCols);

    return (ids) => {
        const finalFilterCols = [
            ...filterCols,
            ...Object.keys(permanentFilters),
        ];
        const finalIdentifiers = {
            ...ids,
            ...permanentFilters,
        };
        const parameters = _one
            ? sanitizeIdentifier(finalFilterCols, finalIdentifiers)
            : sanitizeParameter(finalFilterCols, finalIdentifiers);
        const where = whereQuery(parameters, finalFilterCols);
        const sql = `DELETE FROM ${table} ${where} ${returning}`;

        return {
            sql,
            parameters,
            returnOne: _one,
        };
    };
};
