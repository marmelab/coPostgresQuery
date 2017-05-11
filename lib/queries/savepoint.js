export default name => ({
    sql: `SAVEPOINT ${name}`,
});
