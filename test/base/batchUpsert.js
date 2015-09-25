'use strict';

import batchUpsert from '../../base/batchUpsert';
import moment from 'moment';

describe('batchUpsert', function () {
    var batchUpsertQuery;
    var currentMonth = moment().endOf('month').startOf('day').toDate();
    var lastMonth = moment().subtract(1, 'month').endOf('month').startOf('day').toDate();
    var twoMonthAgo = moment().subtract(2, 'month').endOf('month').startOf('day').toDate();

    describe('with autoincrement key', function () {
        var ids;

        before(function* () {
            batchUpsertQuery = batchUpsert(db.client, 'tag', ['id'], ['name'], 'id');
        });

        beforeEach(function* () {
            var tags = yield [
                { name: 'tag1' },
                { name: 'tag2' },
                { name: 'tag3' }
            ].map(fixtureLoader.addTag);

            ids = tags.map(tag => tag.id);
        });

        it('should update array of entities in a single request', function* () {
            var newTags = [
                { id: ids[0], name: 'newTag1' },
                { id: ids[1], name: 'newTag2' }
            ];

            yield batchUpsertQuery(newTags);

            var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;

            assert.deepEqual(updatedTags, [
                { id: ids[0], name: 'newTag1' },
                { id: ids[1], name: 'newTag2' },
                { id: ids[2], name: 'tag3' }
            ]);
        });

        it('should create unexisting entities', function* () {
            var newTags = [
                { id: ids[0], name: 'newTag1' },
                { id: ids[1], name: 'newTag2' },
                { name: 'tag4'},
                { name: 'tag5'}
            ];

            yield batchUpsertQuery(newTags);

            var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;
            var lastIds = (yield db.client.query_('SELECT id FROM tag ORDER BY id DESC LIMIT 2'))
            .rows.map(tag => tag.id);

            assert.deepEqual(updatedTags, [
                { id: ids[0], name: 'newTag1' },
                { id: ids[1], name: 'newTag2' },
                { id: ids[2], name: 'tag3' },
                { id: lastIds[1], name: 'tag4' },
                { id: lastIds[0], name: 'tag5' }
            ]);
        });

        afterEach(function* () {
            yield db.client.query_('TRUNCATE tag CASCADE');
        });
    });

    describe('with multiple key (date and author)', function (argument) {
        let authors;
        before(function* () {
            batchUpsertQuery = batchUpsert(db.client, 'post', ['author', 'date'], ['title']);
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

            var updatedPost = (yield db.client.query_('SELECT author, title, date from post ORDER BY id')).rows;

            assert.deepEqual(updatedPost, [
                { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
                { author: authors[1].id, date: lastMonth, title: '2 low' },
                { author: authors[0].id, date: lastMonth, title: '3 sides' },
                { author: authors[1].id, date: twoMonthAgo, title: '4 elements' }
            ]);
        });

        it.skip('should create unexisting entities', function* () {
            var newPost = [
                { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
                { author: authors[0].id, date: twoMonthAgo, title: '6 branched star' },
                { author: authors[1].id, date: currentMonth, title: '7 samurai' }
            ];

            yield batchUpsertQuery(newPost);

            var updatedPost = (yield db.client.query_('SELECT author title, date from post ORDER BY id')).rows;

            assert.deepEqual(updatedPost, [
                { author: authors[0].id, date: currentMonth, title: '1 vs 100' },
                { author: authors[1].id, date: lastMonth, title: '2 low' },
                { author: authors[0].id, date: lastMonth, title: '3 sides' },
                { author: authors[1].id, date: twoMonthAgo, title: '4 elements' },
                { author: authors[0].id, date: twoMonthAgo, title: '6 branched star' },
                { author: authors[1].id, date: currentMonth, title: '7 samurai' }
            ]);
        });

        afterEach(function* () {
            yield db.client.query_('TRUNCATE post CASCADE');
        });

        after(function* () {
            yield db.client.query_('TRUNCATE author CASCADE');
        });
    });

});
