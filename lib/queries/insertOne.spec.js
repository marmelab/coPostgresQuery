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
        });
    });

    it('should ignore missing parameter', () => {
        const insertOneQuery = insertOneQuerier({ table: 'table', fields: ['fielda', 'fieldb'] });
        assert.deepEqual(insertOneQuery({ fielda: 'a' }), {
            sql: 'INSERT INTO table\n(fielda)\nVALUES($fielda)\nRETURNING *',
            parameters: {
                fielda: 'a',
            },
        });
    });

    it('should be configurable', () => {
        const insertOneQuery = insertOneQuerier()
        .table('other')
        .fields(['a', 'b'])
        .returnFields(['a', 'c']);
        assert.deepEqual(insertOneQuery({ a: 'a', b: 'b' }), {
            sql: 'INSERT INTO other\n(a, b)\nVALUES($a, $b)\nRETURNING a, c',
            parameters: {
                a: 'a',
                b: 'b',
            },
        });
    });
});
