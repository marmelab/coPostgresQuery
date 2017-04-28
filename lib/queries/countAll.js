import configurable from 'configurable.js';

function countAll() {
    const {
        table,
    } = this.config;

    const sql = `SELECT COUNT(*) FROM ${table};`;

    return { sql };
}

export default ({ table }) =>
    configurable(countAll, { table });
