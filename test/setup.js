'use strict';

import pgClient from '../services/pg-client';
import { assert } from 'chai';
import fixtureLoaderFactory from './utils/fixtureLoader';

before(function* () {
    global.assert = assert;
    global.db = yield pgClient('postgres://postgres@copostgres_db_1:5432/postgres');

    yield global.db.client.query_(`CREATE TABLE IF NOT EXISTS tag (
        id              serial primary key,
        name            varchar(255)
    );`);

    yield global.db.client.query_(`CREATE TABLE IF NOT EXISTS author (
        id              serial primary key,
        name            varchar(255),
        firstname      varchar(255)
    );`);

    yield global.db.client.query_(`CREATE TABLE IF NOT EXISTS post (
        id              serial primary key,
        author          integer NOT NULL REFERENCES author(id) ON DELETE CASCADE,
        title           varchar(255),
        date            timestamp with time zone
    );`);

    global.fixtureLoader = fixtureLoaderFactory(global.db.client);
});

after(function () {
    global.db.done();
});
