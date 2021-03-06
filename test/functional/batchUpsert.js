import moment from 'moment';

import { batchUpsert as batchUpsertQuery } from '../../lib';

describe('batchUpsert', () => {
    let batchUpsert;
    const currentMonth = moment().endOf('month').startOf('day')
    .toDate();
    const lastMonth = moment().subtract(1, 'month').endOf('month')
    .startOf('day')
    .toDate();
    const twoMonthAgo = moment().subtract(2, 'month').endOf('month')
    .startOf('day')
    .toDate();

    before(() => {
        batchUpsert = db.link(batchUpsertQuery({
            table: 'post',
            primaryKey: ['author', 'date'],
            writableCols: ['title'],
        }));
    });

    beforeEach(function* () {
        yield [
            { author: 'john', date: currentMonth, title: '1 vs 1' },
            { author: 'jane', date: lastMonth, title: '2 much' },
            { author: 'john', date: lastMonth, title: '3 sides' },
            { author: 'jane', date: twoMonthAgo, title: '4 elements' },
        ].map(fixtureLoader.addPost);
    });

    it('should update array of rows in a single request', function* () {
        const newPost = [
            { author: 'john', date: currentMonth, title: '1 vs 100' },
            { author: 'jane', date: lastMonth, title: '2 low' },
        ];

        yield batchUpsert(newPost);

        const updatedPost = yield db.query({
            sql: 'SELECT author, title, date from post ORDER BY id',
        });

        assert.deepEqual(updatedPost, [
            { author: 'john', date: currentMonth, title: '1 vs 100' },
            { author: 'jane', date: lastMonth, title: '2 low' },
            { author: 'john', date: lastMonth, title: '3 sides' },
            { author: 'jane', date: twoMonthAgo, title: '4 elements' },
        ]);
    });

    it('should create unexisting rows', function* () {
        const newPost = [
            { author: 'john', date: currentMonth, title: '1 vs 100' },
            { author: 'john', date: twoMonthAgo, title: '6 branched star' },
            { author: 'jane', date: currentMonth, title: '7 samurai' },
        ];

        yield batchUpsert(newPost);

        const updatedPost = yield db.query({
            sql: 'SELECT author, title, date from post ORDER BY id',
        });

        assert.deepEqual(updatedPost, [
            { author: 'john', date: currentMonth, title: '1 vs 100' },
            { author: 'jane', date: lastMonth, title: '2 much' },
            { author: 'john', date: lastMonth, title: '3 sides' },
            { author: 'jane', date: twoMonthAgo, title: '4 elements' },
            { author: 'john', date: twoMonthAgo, title: '6 branched star' },
            { author: 'jane', date: currentMonth, title: '7 samurai' },
        ]);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE post CASCADE' });
    });

    after(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE' });
    });
});
