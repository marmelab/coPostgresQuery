'use strict';

import coPg from 'co-pg';
import pg from 'pg';
var postgresql = coPg(pg);
import * as named from 'node-postgres-named';

export default function* pgClient(dsn) {
    var connect = yield postgresql.connect_(dsn);
    var client = connect[0];

    named.patch(client);
    var query = client.query;

    client.query_ = function (queryString, values) {
        return function (cb) {
            query(queryString, values, cb);
        };
    };

    client.id = (yield client.query_('SELECT pg_backend_pid()')).rows[0].pg_backend_pid;

    return {
        client: client,
        done: connect[1]
    };
}
