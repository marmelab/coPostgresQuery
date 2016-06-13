import configurable from 'configurable.js';
import whereQuery from './whereQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, idField) {
    let config = {
        table,
        idField
    };

    function countAll(parameters) {
        const {
            table,
            idField
        } = config;

        const sql = `SELECT COUNT(${idField}) FROM ${table};`;

        return { sql };
    }

    return configurable(countAll, config);
}
