import batchInsertQuerier from '../../queries/batchInsert';

describe('QUERY batchInsert', function () {
    it('shoul generate sql and parameter for batchInserting given entities', function () {
        const batchInsertQuery = batchInsertQuerier('table', [ 'fielda', 'fieldb' ]);
        assert.deepEqual(batchInsertQuery([ { fielda: 1, fieldb: 2 }, { fielda: 3, fieldb: 4 }]), {
            sql: 'INSERT INTO table(fielda, fieldb) VALUES ($fielda0, $fieldb0), ($fielda1, $fieldb1) RETURNING *;',
            parameters: {
                fielda0: 1,
                fieldb0: 2,
                fielda1: 3,
                fieldb1: 4
            }
        });
    });

    it('shoul set to null if field is missing', function () {
        const batchInsertQuery = batchInsertQuerier('table', [ 'fielda', 'fieldb' ]);
        assert.deepEqual(batchInsertQuery([{ fielda: 1 }, { fielda: 3, fieldb: 4 }]), {
            sql: 'INSERT INTO table(fielda, fieldb) VALUES ($fielda0, $fieldb0), ($fielda1, $fieldb1) RETURNING *;',
            parameters: {
                fielda0: 1,
                fieldb0: null,
                fielda1: 3,
                fieldb1: 4
            }
        });
    });

});
