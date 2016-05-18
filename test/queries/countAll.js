import countAllQuerier from '../../lib/queries/countAll';

describe('QUERY countAll', function () {

    it('should generate sql and parameter for selecting one entity', function () {
        const countAllQuery = countAllQuerier('table', 'id');
        assert.deepEqual(countAllQuery(), {
            sql: 'SELECT COUNT(id) FROM table;'
        });
    });

});
