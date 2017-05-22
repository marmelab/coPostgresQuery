import { selectOne as selectOneQuery } from '../../lib';

describe('functional selectOne', () => {
    let author;

    before(function* () {
        author = yield fixtureLoader.addAuthor({});
    });

    it('should select row once executed', function* () {
        const selectOne = db.link(selectOneQuery({
            table: 'author',
            primaryKey: ['id'],
            returnCols: [
                'id',
                'name',
                'firstname',
            ],
        }));

        const result = yield selectOne({ id: author.id });

        assert.deepEqual(result, author);
    });

    it('should return undefined if no author match once executed', function* () {
        const selectOne = db.link(selectOneQuery({
            table: 'author',
            primaryKey: ['id'],
            returnCols: [
                'name',
                'firstname',
            ],
        }));

        const result = yield selectOne({ id: 404 });

        assert.deepEqual(result, undefined);
    });

    after(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE' });
    });
});
