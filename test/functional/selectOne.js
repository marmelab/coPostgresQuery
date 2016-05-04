import selectOne from '../../lib/queries/selectOne';

describe('functional selectOne', function () {
    let author;

    before(function* () {
        author = yield fixtureLoader.addAuthor({});
    });

    it('should select entity once executed', function* () {
        const selectOneQuery = selectOne('author', [ 'id' ], ['id', 'name', 'firstname']);

        const result = yield db.query(selectOneQuery({ id: author.id }));

        assert.deepEqual(result, [author]);
    });

    it('should return undefined if no autohr match once executed', function* () {
        const selectOneQuery = selectOne('author', [ 'id' ], ['name', 'firstname']);

        const result = yield db.queryOne(selectOneQuery({ id: 404 }));

        assert.deepEqual(result, undefined);
    });

    after(function* () {
        yield db.query({sql: 'TRUNCATE author CASCADE'});
    });
});
