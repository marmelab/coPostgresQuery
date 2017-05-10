export default () => name => ({
    sql: name ? `ROLLBACK TO ${name}` : 'ROLLBACK',
});
