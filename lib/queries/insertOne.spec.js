import { assert } from 'chai';

import insertOneQuerier from './insertOne';

describe('QUERY insertOne', () => {
    it('should generate sql and parameter for inserting one row', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', writableCols: ['columna', 'columnb'] });
        assert.deepEqual(insertOneQuery({ columna: 'a', columnb: 'b' }), {
            sql: 'INSERT INTO table\n(columna, columnb)\nVALUES($columna, $columnb)\nRETURNING *',
            parameters: {
                columna: 'a',
                columnb: 'b',
            },
            returnOne: true,
        });
    });

    it('should ignore parameter not in column', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', writableCols: ['columna', 'columnb'] });
        assert.deepEqual(insertOneQuery({ columna: 'a', columnb: 'b', columnc: 'ignored' }), {
            sql: 'INSERT INTO table\n(columna, columnb)\nVALUES($columna, $columnb)\nRETURNING *',
            parameters: {
                columna: 'a',
                columnb: 'b',
            },
            returnOne: true,
        });
    });

    it('should ignore missing parameter', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', writableCols: ['columna', 'columnb'] });
        assert.deepEqual(insertOneQuery({ columna: 'a' }), {
            sql: 'INSERT INTO table\n(columna)\nVALUES($columna)\nRETURNING *',
            parameters: {
                columna: 'a',
            },
            returnOne: true,
        });
    });
});
