import insertOneQuerier from '../../lib/queries/insertOne';

describe('QUERY insertOne', function () {

    it('should generate sql and parameter for inserting one entity', function () {
        const insertOneQuery = insertOneQuerier('table', ['fielda', 'fieldb']);
        assert.deepEqual(insertOneQuery({ fielda: 'a', fieldb: 'b' }), {
            sql: 'INSERT INTO table\n(fielda, fieldb)\nVALUES($fielda, $fieldb)\nRETURNING *',
            parameters: {
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

    it('should ignore parameter not in field', function () {
        const insertOneQuery = insertOneQuerier('table', ['fielda', 'fieldb']);
        assert.deepEqual(insertOneQuery({ fielda: 'a', fieldb: 'b', fieldc: 'ignored' }), {
            sql: 'INSERT INTO table\n(fielda, fieldb)\nVALUES($fielda, $fieldb)\nRETURNING *',
            parameters: {
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

    it('should ignore missing parameter', function () {
        const insertOneQuery = insertOneQuerier('table', ['fielda', 'fieldb']);
        assert.deepEqual(insertOneQuery({ fielda: 'a' }), {
            sql: 'INSERT INTO table\n(fielda)\nVALUES($fielda)\nRETURNING *',
            parameters: {
                fielda: 'a'
            }
        });
    });

    it('should be configurable', function () {
        const insertOneQuery = insertOneQuerier()
        .table('other')
        .fields(['a', 'b'])
        .returnFields(['a', 'c']);
        assert.deepEqual(insertOneQuery({ a: 'a', b: 'b' }), {
            sql: 'INSERT INTO other\n(a, b)\nVALUES($a, $b)\nRETURNING a, c',
            parameters: {
                a: 'a',
                b: 'b'
            }
        });
    });

    it('should insert given entities when executed', function* () {
        const result = (yield db.query(insertOneQuerier('author', ['name', 'firstname'])({ name: 'doe', firstname: 'john'})))[0];
        assert.equal(result.name, 'doe');
        assert.equal(result.firstname, 'john');
        const insertedEntity = (yield db.query({sql: 'SELECT * FROM author WHERE id = $id', parameters: { id: result.id }}))[0];

        assert.deepEqual(insertedEntity, result);
    });

});
