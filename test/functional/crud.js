import { crud } from '../../lib';

describe('crud', function () {
    let queries;

    before(function () {
        queries = crud('author', ['id', 'name', 'firstname'], ['id'])(db);
    });

    it('should insert entity', function* () {
        const result = yield queries.insertOne({ firstname: 'john', name: 'doe' });
        assert.deepEqual(result[0].name, 'doe');
        assert.deepEqual(result[0].firstname, 'john');

        var savedAuthors = yield db.query({ sql: 'SELECT * from author ORDER BY id' });
        assert.deepEqual(result, savedAuthors);
    });

    it('should select one entity', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield queries.selectOne({ id: author.id });

        assert.deepEqual(result, [author]);
    });

    it('should delete entity', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield queries.deleteOne({ id: author.id });

        assert.deepEqual(result, [author]);

        assert.isUndefined(yield db.queryOne({ sql: 'SELECT * FROM author WHERE id = $id', parameters: { id: author.id } }));
    });

    it('should update entity', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield queries.updateOne({ id: author.id }, { name: 'mae', firstname: 'jane' });

        assert.deepEqual(result, [{
            ...author,
            name: 'mae',
            firstname: 'jane'
        }]);

        var savedAuthors = yield db.query({ sql: 'SELECT * from author ORDER BY id' });
        assert.deepEqual(savedAuthors, [{
            ...author,
            name: 'mae',
            firstname: 'jane'
        }]);
    });

    it('should select page of entity', function* () {
        const authors = yield [
            { firstname: 'john', name: 'doe' },
            { firstname: 'jane', name: 'mae' }
        ].map(author => fixtureLoader.addAuthor(author));

        const result = yield queries.selectPage();
        assert.deepEqual(result, authors.map(author => ({ ...author, totalcount: '2' })));
    });

    afterEach(function* () {
        yield db.query({sql: 'TRUNCATE author CASCADE'});
    });

});
