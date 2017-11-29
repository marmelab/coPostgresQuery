import batchParameter from './helpers/batchParameter';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import combineLiterals from '../utils/combineLiterals';
import whereQuery from './helpers/whereQuery';
import returningQuery from './helpers/returningQuery';

export default ({ table, returnCols, primaryKey = ['id'], permanentFilters = {} }) => {
    const returning = returningQuery(returnCols);
    const selector = [].concat(primaryKey);

    return (ids) => {
        const idSanitizer = sanitizeIdentifier(selector);
        const cleanIds = ids.map(id => idSanitizer(id));

        const parameters = batchParameter(selector)(cleanIds);

        const where = whereQuery(combineLiterals(cleanIds), selector);

        const permanentFiltersKeys = Object.keys(permanentFilters);
        let permanentWhere = '';
        let permanentParameters = {};
        if (permanentFiltersKeys.length) {
            permanentParameters = sanitizeIdentifier(permanentFiltersKeys, permanentFilters);
            permanentWhere = whereQuery(permanentParameters, permanentFiltersKeys).replace('WHERE', ' AND');
        }

        const sql = `DELETE FROM ${table} ${where}${permanentWhere} ${returning};`;

        return {
            sql,
            parameters: {
                ...parameters,
                ...permanentParameters,
            },
        };
    };
};
