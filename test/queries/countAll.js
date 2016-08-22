import countAllQuerier from '../../lib/queries/countAll';

describe('QUERY countAll', () => {
    it('should generate sql and parameter for selecting one entity', () => {
        const countAllQuery = countAllQuerier('table', 'id');
        assert.deepEqual(countAllQuery(), {
            sql: 'SELECT COUNT(id) FROM table;',
        });
    });
});
