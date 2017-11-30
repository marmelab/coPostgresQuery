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

        const where = whereQuery({
            ...combineLiterals(cleanIds),
            ...permanentFilters,
        }, [
            ...selector,
            ...Object.keys(permanentFilters),
        ]);

        const sql = `DELETE FROM ${table} ${where} ${returning};`;

        return {
            sql,
            parameters: {
                ...parameters,
                ...permanentFilters,
            },
        };
    };
};
