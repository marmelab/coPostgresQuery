'use strict';

import batchUpsert from '../../base/batchUpsert';
import moment from 'moment';

describe('batchUpsert', function () {
    var batchUpsertQuery;
    var currentMonth = moment().endOf('month').startOf('day').toDate();
    var lastMonth = moment().subtract(1, 'month').endOf('month').startOf('day').toDate();
    var twoMonthAgo = moment().subtract(2, 'month').endOf('month').startOf('day').toDate();

    let authors;
    before(function* () {
        batchUpsertQuery = batchUpsert('post', ['author', 'date'], ['title'])(db);
        authors = yield [
            { name: 'doe', firstname: 'john'},
            { name: 'dee', firstname: 'jane'}
        ]
        .map(fixtureLoader.addAuthor);
    });

    beforeEach(function* () {
        yield [
            { author: authors[0].id, date: currentMonth, title: '1 vs 1' },
            { author: authors[1].id, date: lastMonth, title: '2 much' },
            { author: authors[0].id, date: lastMonth, title: '3 sides' },
            { author: authors[1].id, date: twoMonthAgo, title: '4 elements' }
        ].map(fixtureLoader.addPost);

    });

    it('should update array of entities in a single request', function* () {
        var newPost = [
            { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
            { author: authors[1].id, date: lastMonth, title: '2 low' }
        ];

        yield batchUpsertQuery(newPost);

        var updatedPost = yield db.query({ sql: 'SELECT author, title, date from post ORDER BY id'});

        assert.deepEqual(updatedPost, [
            { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
            { author: authors[1].id, date: lastMonth, title: '2 low' },
            { author: authors[0].id, date: lastMonth, title: '3 sides' },
            { author: authors[1].id, date: twoMonthAgo, title: '4 elements' }
        ]);
    });

    it('should create unexisting entities', function* () {
        var newPost = [
            { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
            { author: authors[0].id, date: twoMonthAgo, title: '6 branched star' },
            { author: authors[1].id, date: currentMonth, title: '7 samurai' }
        ];

        yield batchUpsertQuery(newPost);

        var updatedPost = yield db.query({ sql: 'SELECT author, title, date from post ORDER BY id'});

        assert.deepEqual(updatedPost, [
            { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
            { author: authors[1].id, date: lastMonth, title: '2 much' },
            { author: authors[0].id, date: lastMonth, title: '3 sides' },
            { author: authors[1].id, date: twoMonthAgo, title: '4 elements' },
            { author: authors[0].id, date: twoMonthAgo, title: '6 branched star' },
            { author: authors[1].id, date: currentMonth, title: '7 samurai' }
        ]);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE post CASCADE'});
    });

    after(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE'});
    });

});
