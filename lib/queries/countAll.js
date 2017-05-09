export default ({ table }) => () => {
    const sql = `SELECT COUNT(*) FROM ${table};`;

    return { sql, returnOne: true };
};
