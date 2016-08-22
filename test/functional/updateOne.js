import { updateOne } from '../../lib';

describe('updateOne', () => {
    let author;
    before(function* () {
        author = yield fixtureLoader.addAuthor({ name: 'john', firstname: 'doe' });
    });

    it('should update entity returning all field by default', function* () {
        const updateOneQuery = updateOne('author', ['name', 'firstname'], ['name'])(db);
        const result = yield updateOneQuery({ name: author.name }, { firstname: 'jane' });
        assert.deepEqual(result.firstname, 'jane');

        const savedTags = yield db.query({ sql: 'SELECT * from author ORDER BY id' });
        assert.deepEqual([result], savedTags);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE' });
    });
});
