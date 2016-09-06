import { assert } from 'chai';

import { PgPool } from '../lib';
import fixtureLoaderFactory from './utils/fixtureLoader';

before(function* () {
    global.assert = assert;

    global.pgPool = PgPool({
        user: 'postgres',
        database: 'postgres',
        host: 'db',
    }, {
        max: 30,
        idleTimeoutMillis: 30000,
    });

    global.db = yield global.pgPool.connect();

    yield global.db.query({ sql: 'DROP TABLE IF EXISTS tag;' });
    yield global.db.query({ sql: `CREATE TABLE IF NOT EXISTS tag (
        id              serial primary key,
        name            varchar(255) UNIQUE
    );` });
    yield global.db.query({ sql: 'DROP TABLE IF EXISTS post;' });
    yield global.db.query({ sql: `CREATE TABLE IF NOT EXISTS post (
        id              serial primary key,
        author          varchar(32) NOT NULL,
        title           varchar(255),
        date            timestamp with time zone,
        unique          (author, date)
    );` });
    yield global.db.query({ sql: 'DROP TABLE IF EXISTS author;' });
    yield global.db.query({ sql: `CREATE TABLE IF NOT EXISTS author (
        id              serial primary key,
        name            varchar(255),
        firstname      varchar(255)
    );` });

    global.fixtureLoader = fixtureLoaderFactory(global.db);
});

beforeEach(function* () {
    global.db = yield global.pgPool.connect();
});

afterEach(() => {
    global.db.release();
});

after(() => {
    global.db.end();
    global.pgPool.end();
});
