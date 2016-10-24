import configurable from 'configurable.js';

function countAll() {
    const {
        table,
        idField,
    } = this.config;

    const sql = `SELECT COUNT(${idField}) FROM ${table};`;

    return { sql };
}

export default function (table, idField) {
    const config = {
        table,
        idField,
    };

    return configurable(countAll, config);
}
