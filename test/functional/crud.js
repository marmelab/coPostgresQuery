import { crud as crudQueries } from '../../lib';

describe('crud', () => {
    let crud;

    before(() => {
        crud = db.link(crudQueries({
            table: 'author',
            writableCols: ['name', 'firstname'],
            primaryKey: ['id'],
            returnCols: ['name', 'firstname'],
        }));
    });

    it('should insert row', function* () {
        const result = yield crud.insertOne({ firstname: 'john', name: 'doe' });
        assert.deepEqual(result.name, 'doe');
        assert.deepEqual(result.firstname, 'john');

        const savedAuthors = yield db.query({
            sql: 'SELECT name, firstname from author ORDER BY id',
        });
        assert.deepEqual([result], savedAuthors);
    });

    it('should select one row', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield crud.selectOne({ id: author.id });

        assert.equal(result.name, author.name);
        assert.equal(result.firstname, author.firstname);
    });

    it('should select page of row', function* () {
        const john = yield fixtureLoader.addAuthor({ name: 'doe', firstname: 'john' });
        const jane = yield fixtureLoader.addAuthor({ name: 'day', firstname: 'jane' });

        const results = yield crud.select();

        assert.equal(results.length, 2);
        assert.equal(results[0].name, john.name);
        assert.equal(results[0].firstname, john.firstname);
        assert.equal(results[1].name, jane.name);
        assert.equal(results[1].firstname, jane.firstname);
    });

    it('should countAll row', function* () {
        yield fixtureLoader.addAuthor({});

        const result = yield crud.countAll();

        assert.deepEqual(result, { count: '1' });
    });

    it('should remove row', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield crud.removeOne({ id: author.id });

        assert.deepEqual(result, author);

        assert.isUndefined(yield db.query({
            sql: 'SELECT * FROM author WHERE id = $id',
            parameters: { id: author.id },
            returnOne: true,
        }));
    });

    it('should update row', function* () {
        const author = yield fixtureLoader.addAuthor({});

        const result = yield crud.updateOne({ id: author.id }, {
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

    it('should select page of row', function* () {
        const authors = yield [
            { firstname: 'john', name: 'doe' },
            { firstname: 'jane', name: 'mae' },
        ].map(author => fixtureLoader.addAuthor(author));

        const result = yield crud.select();
        result.forEach((author, index) => {
            assert.equal(author.name, authors[index].name);
            assert.equal(author.firstname, authors[index].firstname);
        });
    });

    it('should batchInsert rows', function* () {
        const authors = [
            { firstname: 'john', name: 'doe' },
            { firstname: 'jane', name: 'mae' },
        ];
        const result = yield crud.batchInsert(authors);

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
