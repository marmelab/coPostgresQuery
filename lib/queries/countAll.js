import configurable from 'configurable.js';

export default function (initialTable, initialIdField) {
    const config = {
        table: initialTable,
        idField: initialIdField,
    };

    function countAll() {
        const {
            table,
            idField,
        } = config;

        const sql = `SELECT COUNT(${idField}) FROM ${table};`;

        return { sql };
    }

    return configurable(countAll, config);
}
