import { crud } from '../../lib';

describe('crud', () => {
    let queries;

    before(() => {
        queries = crud('author', ['name', 'firstname'], ['id'], ['name', 'firstname'])(db);
    });

    it('should insert entity', function* () {
        const result = yield queries.insertOne({ firstname: 'john', name: 'doe' });
        assert.deepEqual(result.name, 'doe');
        assert.deepEqual(result.firstname, 'john');

        const savedAuthors = yield db.query({
            sql: 'SELECT name, firstname from author ORDER BY id',
        });
        assert.deepEqual([result], savedAuthors);
    });

    it('should select one entity', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield queries.selectOne({ id: author.id });

        assert.equal(result.name, author.name);
        assert.equal(result.firstname, author.firstname);
    });

    it('should select page of entity', function* () {
        const john = yield fixtureLoader.addAuthor({ name: 'doe', firstname: 'john' });
        const jane = yield fixtureLoader.addAuthor({ name: 'day', firstname: 'jane' });

        const results = yield queries.selectPage();

        assert.equal(results.length, 2);
        assert.equal(results[0].name, john.name);
        assert.equal(results[0].firstname, john.firstname);
        assert.equal(results[1].name, jane.name);
        assert.equal(results[1].firstname, jane.firstname);
    });

    it('should countAll entity', function* () {
        yield fixtureLoader.addAuthor({});

        const result = yield queries.countAll();

        assert.deepEqual(result, { count: '1' });
    });

    it('should delete entity', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield queries.deleteOne({ id: author.id });

        assert.deepEqual(result, author);

        assert.isUndefined(yield db.queryOne({
            sql: 'SELECT * FROM author WHERE id = $id',
            parameters: { id: author.id },
        }));
    });

    it('should update entity', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield queries.updateOne({ id: author.id }, {
            name: 'mae',
            firstname: 'jane',
        });

        assert.deepEqual(result, {
            name: 'mae',
            firstname: 'jane',
        });

        const savedAuthors = yield db.query({ sql: 'SELECT * from author ORDER BY id' });
        assert.deepEqual(savedAuthors, [{
            ...author,
            name: 'mae',
            firstname: 'jane',
        }]);
    });

    it('should select page of entity', function* () {
        const authors = yield [
            { firstname: 'john', name: 'doe' },
            { firstname: 'jane', name: 'mae' },
        ].map(author => fixtureLoader.addAuthor(author));

        const result = yield queries.selectPage();
        result.forEach((author, index) => {
            assert.equal(author.name, authors[index].name);
            assert.equal(author.firstname, authors[index].firstname);
            assert.equal(author.totalcount, 2);
        });
    });

    it('should batchInsert entities', function* () {
        const authors = [
            { firstname: 'john', name: 'doe' },
            { firstname: 'jane', name: 'mae' },
        ];
        const result = yield queries.batchInsert(authors);

        result.forEach((author, index) => {
            assert.equal(author.name, authors[index].name);
            assert.equal(author.firstname, authors[index].firstname);
        });

        const savedAuthors = yield db.query({
            sql: 'SELECT name, firstname from author ORDER BY id',
        });
        assert.deepEqual(result, savedAuthors);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE' });
    });
});
