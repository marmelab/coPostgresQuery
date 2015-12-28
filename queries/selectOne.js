import configurable from '../utils/configurable';
import whereQuery from './whereQuery';

export default function (table, identifiers, fields) {
    let config = {
        table,
        identifiers,
        fields
    };

    function selectOne(parameters) {
        const {
            table,
            identifiers,
            fields
        } = config;
        const where = whereQuery(parameters, identifiers);

        const sql = `SELECT ${fields.join(', ')} FROM ${table} ${where.sql} LIMIT 1`;

        return { sql, parameters };
    }

    return configurable(selectOne, config);
}
