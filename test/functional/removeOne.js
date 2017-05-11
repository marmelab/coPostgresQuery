import { removeOneQuery } from '../../lib';

describe('removeOne', () => {
    let author;
    let removeOne;

    before(() => {
        removeOne = db.link(removeOneQuery({ table: 'author', idFields: ['id'] }));
    });

    beforeEach(function* () {
        author = yield fixtureLoader.addAuthor({});
    });

    it('should delete entity once executed', function* () {
        const result = yield removeOne({ id: author.id });
        assert.deepEqual(result, author);

        assert.isUndefined(yield db.query({
            sql: 'SELECT * FROM author WHERE id = $id',
            parameters: { id: author.id },
            returnOne: true,
        }));
    });

    it('should return undefined if no author match once executed', function* () {
        const result = yield removeOne({ id: 404 });

        assert.isUndefined(result);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE' });
    });
});
