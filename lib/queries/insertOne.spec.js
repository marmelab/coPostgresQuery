import { assert } from 'chai';

import insertOneQuerier from './insertOne';

describe('QUERY insertOne', () => {
    it('should generate sql and parameter for inserting one entity', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', fields: ['fielda', 'fieldb'] });
        assert.deepEqual(insertOneQuery({ fielda: 'a', fieldb: 'b' }), {
            sql: 'INSERT INTO table\n(fielda, fieldb)\nVALUES($fielda, $fieldb)\nRETURNING *',
            parameters: {
                fielda: 'a',
                fieldb: 'b',
            },
            returnOne: true,
        });
    });

    it('should ignore parameter not in field', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', fields: ['fielda', 'fieldb'] });
        assert.deepEqual(insertOneQuery({ fielda: 'a', fieldb: 'b', fieldc: 'ignored' }), {
            sql: 'INSERT INTO table\n(fielda, fieldb)\nVALUES($fielda, $fieldb)\nRETURNING *',
            parameters: {
                fielda: 'a',
                fieldb: 'b',
            },
            returnOne: true,
        });
    });

    it('should ignore missing parameter', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', fields: ['fielda', 'fieldb'] });
        assert.deepEqual(insertOneQuery({ fielda: 'a' }), {
            sql: 'INSERT INTO table\n(fielda)\nVALUES($fielda)\nRETURNING *',
            parameters: {
                fielda: 'a',
            },
            returnOne: true,
        });
    });
});
