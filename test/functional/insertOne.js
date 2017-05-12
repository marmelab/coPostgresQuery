import { insertOne as insertOneQuery } from '../../lib';

describe('insertOne', () => {
    it('should insert entity returning all field by default', function* () {
        const insertOne = db.link(insertOneQuery({ table: 'tag', writableFields: ['name'] }));
        const result = yield insertOne({ name: 'tag1' });
        assert.deepEqual(result.name, 'tag1');

        const savedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual([result], savedTags);
    });

    it('should insert entity returning only specified field if given', function* () {
        const insertOne = db.link(insertOneQuery({ table: 'tag', writableFields: ['name'], returnFields: ['id'] }));

        const result = yield insertOne({ name: 'tag1' });

        const savedNames = yield db.query({ sql: 'SELECT name from tag ORDER BY id' });
        assert.deepEqual(savedNames, [{ name: 'tag1' }]);
        const savedIds = yield db.query({ sql: 'SELECT id from tag ORDER BY id' });
        assert.deepEqual([result], savedIds);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE' });
    });
});
