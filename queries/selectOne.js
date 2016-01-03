import configurable from '../utils/configurable';
import whereQuery from './whereQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, selectors, returningFields) {
    let config = {
        table,
        selectors,
        returningFields
    };

    function selectOne(parameters) {
        const {
            table,
            selectors,
            returningFields
        } = config;
        parameters = sanitizeParameter(selectors)(parameters);
        const where = whereQuery(parameters, selectors);

        const sql = `SELECT ${returningFields.join(', ')} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters };
    }

    return configurable(selectOne, config);
}
