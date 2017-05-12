import { assert } from 'chai';

import batchInsertQuerier from './batchInsert';

describe('QUERY batchInsert', () => {
    it('shoul generate sql and parameter for batchInserting given rows', () => {
        const batchInsertQuery = batchInsertQuerier({ table: 'table', writableCols: ['columna', 'columnb'] });
        assert.deepEqual(batchInsertQuery([{ columna: 1, columnb: 2 }, { columna: 3, columnb: 4 }]), {
            sql: 'INSERT INTO table(columna, columnb) VALUES ($columna1, $columnb1), ($columna2, $columnb2) RETURNING *;',
            parameters: {
                columna1: 1,
                columnb1: 2,
                columna2: 3,
                columnb2: 4,
            },
        });
    });

    it('shoul set to null if column is missing', () => {
        const batchInsertQuery = batchInsertQuerier({ table: 'table', writableCols: ['columna', 'columnb'] });
        assert.deepEqual(batchInsertQuery([{ columna: 1 }, { columna: 3, columnb: 4 }]), {
            sql: 'INSERT INTO table(columna, columnb) VALUES ($columna1, $columnb1), ($columna2, $columnb2) RETURNING *;',
            parameters: {
                columna1: 1,
                columnb1: null,
                columna2: 3,
                columnb2: 4,
            },
        });
    });
});
