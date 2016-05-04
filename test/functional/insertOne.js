import insertOne from '../../lib/queries/insertOne';

describe('insertOne', function () {

    it('should insert entity returning all field by default', function* () {
        const insertOneQuery = insertOne('tag', ['name']);
        const result = yield db.query(insertOneQuery({ name: 'tag1' }));
        assert.deepEqual(result[0].name, 'tag1');

        var savedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual(result, savedTags);
    });

    it('should insert list of entity in a single request returning only specified field if given', function* () {
        const insertOneQuery = insertOne('tag', ['name'], ['id']);

        const result = yield db.query(insertOneQuery({ name: 'tag1' }));

        const savedNames = yield db.query({ sql: 'SELECT name from tag ORDER BY id' });
        assert.deepEqual(savedNames, [{ name: 'tag1' }]);
        const savedIds = yield db.query({ sql: 'SELECT id from tag ORDER BY id' });
        assert.deepEqual(result, savedIds);
    });

    afterEach(function* () {
        yield db.query({sql: 'TRUNCATE tag CASCADE'});
    });
});
