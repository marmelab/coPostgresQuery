# coPostgresQueries

Utility to generate and execute postgresql queries with ease.

## Install

`npm install --save co-postgres-queries`

## Introduction

The library can be divided in two parts:

1. [`PgPool`](#PgPool), that allows to connect to the postgres database and execute query.

```js
import PgPool from 'co-postgres-queries';
const clientOptions = {
    user,
    password,
    database,
    host,
    port
};
const pool = new PgPool(clientOptions);

pool.connect()
    .then((client) => {
        return client.query('SELECT * from user WHERE firstname = $firstname', { firstname: 'john' });
    })
    .then(rows => {
        // do something with all the user named john
    });
```

2. The [querybuilders](#query-builder) (insertOne, selectOne, etc..) that allow to generate sql, and the corresponding parameters.

Each query builder takes the form:

```js
query(config)(...parameters);
```

On the first call it receives its configuration, eg, the table name, column name, etc...
For example:

```js
import insertOne  from 'co-postgres-queries/queries/insertOne';
const insertOne = insertOne({
    table: 'user',
    writableCols: ['name', 'firstname'],
    returnCols: ['id', 'name', 'firstname'],
});
```

On the second call it takes the query parameters and returns an object of the form `{ sql, parameters }`,
with the sql containing named parameter, and parameters having been sanitized based on the configuration.
For example:

```js
insertOne({ name: 'doe', firstname: 'john', other: 'data' });
// would return
{
    sql: 'INSERT INTO user (name, firstname)VALUES($name, $firstname) RETURNING id, name, firstname',
    parameters: { name: 'doe', firstname: 'john' }
}
```

The result can then be directly passed to [`client.query`](####client.query) to be executed.

```js
client.query(insertOne({ name: 'doe', firstname: 'john', other: 'data' }));
```

There is also a [`crud`](####crud) helper function to generate basic crud queries for a given table:

```js
const userCrud = crud({
    table: 'user',
    primaryKey: 'id',
    writableCols: ['name', 'firstname', 'mail'],
    returnCols: ['id', 'name', 'firstname', 'mail'],
});
```

This will configure query builders for `selectOne`, `select`, `insert`, `updateOne`, `deleteOne`, `countAll` and `batchInsert` in one literal.

coPostGresQueries provides the [`saga`](####client.saga) command to execute the generated query as effect in a generator.

```js
function* subscribeUser(userId) {
    try {
        yield begin(); // begin transaction block
        const user = yield userCrud.selectOne(userId);

        if (!user) {
            throw new Error('not found');
        }

        yield userCrud.updateOne(userId, { subscribed: true });

        // ... some other queries

        yield commit();
        return result;
    } catch (error) {
        yield rollback();
        throw error;
    }
    ...
}

client.saga(getUserAndDoSomething(5)).then(...);
```

since the generator yield only query Object, it is easily testable.

## Api

### PgPool

Extend [node-pg-pool](https://github.com/brianc/node-pg-pool)
Allow to connect to postgresql and execute query
It adds:

- Support for named parameters.
- query: Now return the list of results.
- Added queryOne: Same as query but return only one result instead of an array.
- Helper method ([begin, savepoint, rollback, commit][###client.begin, client.commit, client.savepoint, client.rollback]) to handle transactions on the client.
- Helper method ([link][### client.link]) to link a query helper to the client or pool.

#### Creating a pool

```js
import PgPool from 'co-postgres-queries';
const clientOptions = {
    user,
    password,
    database,
    host,
    port
};
const poolingOptions = {
    max, // Max number of clients to create (defaults to 10)
    idleTimeoutMillis // how long a client is allowed to remain idle before being closed (defaults to 30 000 ms)
}
const pool = new PgPool(clientOptions, poolingOptions);
```

#### Getting client with promise

```js
const pool = new pgPool();
pool.connect().then((client) => {
    // use the client
});

// async/await
(async () => {
    const pool = new pgPool();
    const client = await pool.connect();
})();

// co
co(function* () {
    const pool = new pgPool();
    const client = yield pool.connect();
});
```

#### client.query

Executes a query, it takes three parameters:

- sql: the sql to execute
- parameters: the parameters to inject in the sql (it use named parameters)
- returnOne: Optional, if set to true, returns only the first result instead of an array.

```js
// query use named parameter
client.query('SELECT $name::text as name', { name: 'world' }) // query return a promise
.then((result) => {
    // result contain directly the row
    console.log(`Hello ${result[0].name}`);
});

// It work with async/await
(async() => {
    const pool = new PgPool();
    const result = await pool.query('SELECT $name::text as name', { name: 'world' });

    console.log(`Hello ${result[0].name}`);
})()
// Or with co
co(function* () {
    const pool = new PgPool();
    const result = yield pool.query('SELECT $name::text as name', { name: 'world' });

    console.log(`Hello ${result[0].name}`);
});
```

`client.query` can also be called with an object literal:

```js
pool.query({
    sql: 'SELECT $name::text as name',
    parameters: { name: 'world' },
});
```

#### pool.query

You can also execute a query directly from the pool.
A client will then get automatically retrieved, and released once the query is done.
Transactions are not possible this way since the client would change on each query.

#### client.link

Take a query or a literal of query and returns a function that takes the query parameter and executes it

```js
const query = insertOneQuery('table', ['col1', 'col2']);

const insertOne = client.link(query);

yield insertOne({ col1: 'val1', col2: 'val2' });

// or
const queries = crudQueries(table, ['col1', 'col2'], ['col1']);

const crud = client.link(queries);

yield crud.insertOne({ col1: 'val1', col2: 'val2' });
```

#### client.release

Return the client to the pool, to be used again.
Do not forget to call this when you are done.

#### client.end

Close the client. It will not return to the pool.

#### client.saga

Take a generator yielding object queries (`{ sql, parameters }`), and return an async function that run the generator executing the yielded query.

```js
function* getUserAndDoSomething(id) {
    const user = yield {
        sql: 'SELECT * FROM user WHERE $id=id',
        parameters: { id },
        returnOne: true,
    };
    ...
}

client.saga(getUserAndDoSomething(5)).then(...);
```

The yielded query object will be internally passed to `client.query` then the result will be passed back to the generator.
If an error occurs during the query, it will be thrown back into the generator where it can be catched.

```js
const executeQUery = client.saga(function* (id) {
    try {
        const user = yield {
            sql: 'bad query',
        };
        ...
    } catch (error) {
        // handle the error
    }
});
```

Since the queries functions return query object, they can be yielded.

```js
const selectOneUserById = selectOne({ table: 'user' });

const getUserAndDoSomethig = client.saga(function* (id) {
    const user = yield selectOneByUserId({ id });
    ...
});
```

You can also yield an array of query to be run in parallel:

```js
const getUserAndCommands = client.saga(function* (id) {
    const [user, commands] = yield [
        selectOneByUserId({ id }),
        selectCommandsByUserId({ id }),
    ];
    ...
});
```

Or even a literal:

```js
const getUserAndCommands = client.saga(function* (id) {
    const { user, commands } = yield {
        user: selectOneByUserId({ id }),
        commands: selectCommandsByUserId({ id }),
    };
    ...
});
```

Since the generator yield plain objects, they can be easily tested without needing any mocks:

```js
const iterator = someQueryGenerator();
const { value: { sql, parameters } } = iterator.next();
// we get the generated sql and parameters.

iterator.next(queryResult); // we can pass what we want as result

iterator.throw(queryError); // or we can resume by throwing error
```

### Query builder

Each query helper takes the form:

```js
query(config)(...parameters);
```

On the first call it receives its configuration, eg, the table name, column name, etc...
For example:

```js
import insertOne  from 'co-postgres-queries/queries/insertOne';
const insertOne = insertOne({
    table: 'user',
    writableCols: ['name', 'firstname'],
    returnCols: ['id', 'name', 'firstname'],
});
```

On the second call it takes the query parameters and returns an object of the form `{ sql, parameters }`,
with the sql containing named parameter, and parameters having been sanitized based on the configuration.
For example:

```js
insertOne({ name: 'doe', firstname: 'john', other: 'data' });
// would return
{
    sql: 'INSERT INTO user (name, firstname)VALUES($name, $firstname) RETURNING id, name, firstname',
    parameters: { name: 'doe', firstname: 'john' }
}
```

The result can then be directly passed to `client.query` to be executed.

#### insertOne

```js
import insertOne  from 'co-postgres-queries/queries/insertOne';
insertOne({ table, writableCols, returnCols })(row)
```

Returns a query to insert one given row.

##### Configuration

- table: the table name
- writableCols: lisft of columns that can be set
- returnCols: list of columns exposed in the result of the query

##### Parameters

A literal object in the form of:

```js
{
    column: value,
    ...
}
```

#### batchInsert(table, writableCols, returnCols)(rows)

```js
import batchInsert from 'co-postgres-queries/queries/batchInsert';
batchInsert(table, writableCols, returnCols)(rows);
```

allow to create a query to insert an array of rows.

##### Configuration

- table: the table name
- writableCols: list of columns that can be set
- returnCols: list of columns exposed in the result of the query

##### Parameters

An array of literal objects in the form of:

```js
[
    {
        column: value,
        ...
    }, ...
]
```

#### selectOne

```js
import selectOne  from 'co-postgres-queries/queries/selectOne';
selectOne({ table, primaryKey, returnCols })(row)
```

Creates a query to select one row.

##### Configuration

- table: the table name
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- returnCols: list of columns retrieved by the query

##### Parameters

A literal in the form of:

```js
{
    id1: value,
    id2: value,
    ...
}
```

Any key not present in primaryKey will be ignored.

#### select

```js
import select from 'co-postgres-queries/queries/select';
select({
    table,
    primaryKey,
    returnCols,
    searchableCols,
    specificSorts,
    groupByCols,
    withQuery,
    returnOne,
})({ limit, offset, filters, sort, sortDir });
```

Creates a query to select one row.

##### Configuration

- table:
    the table name, accept JOIN statements
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- returnCols:
    list of columns retrieved by the query
- searchableCols:
    list of columns that can be searched (usable in filter parameter). Defaults to return columns
- specificSorts:
    allow to specify sort order for a given column. Useful when we want to order string other than by alphabetical order.
    example:
    ```js
    {
        level: ['master', 'expert', 'novice']
    }
    ```
    will order level column with all master first, then expert and finally novice
- groupByCols
    allow to add a GROUP BY clause to the query on the given columns
- withQuery
    specify that we want to encompass the query in `WITH RESULT AS <query> SELECT * FROM result`
    This add a temporary result table that allow to sort on computed and joined column.
    if the table configuration contain a JOIN clause, this will be automatically set to true.
- returnOne: Optional, if set to true, returns only the first result instead of an array.

##### Parameters

A literal object with:

- limit:
    number of results to be returned
- offset:
    number of results to be ignored
- filters
    literal specifying wanted value for given column
    example:
    ```js
    {
        column: 'value'
    }
    ```
    will return only row for which row.column equal 'value'
- sort:
    Specify the column by which to filter the result (Additionally the result will always get sorted by the row identifiers to avoid random order)
- sortDir:
    Specify the sort direction, either 'ASC' or 'DESC'


#### update

```js
import update  from 'co-postgres-queries/queries/update';
update({
    table,
    writableCols,
    filterCols,
    returnCols,
})(filters, data);
```

Creates a query to update rows.

##### Configuration

- table: the table name
- writableCols: the columns that can be updated
- filterCols: the columns that can be used to filter the updated rows
- returnCols: the columns to be returned in the result

##### Parameters

Two arguments:

- filters:
    literal specifying wanted value for given column
    example:
    ```js
    {
        column: 'value'
    }
    ```
    will update only row for which column equal 'value'
- data: a literal specifying the new values

#### updateOne

```js
import updateOne  from 'co-postgres-queries/queries/updateOne';
updateOne({
    table,
    writableCols,
    primaryKey,
    returnCols,
})(identifier, data);
```

Creates a query to update one row.

##### Configuration

- table: the table name
- writableCols: the columns that can be updated
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- returnCols: the columns to be returned in the result

##### Parameters

Two arguments:

- identifier: either a single value for a single primaryKey column, or a literal if several columns:`{ id1: value, id2: otherValue }`. All configured primaryKey columns must be given a value.
- data: a literal specifying the column to update

#### remove

```js
import remove  from 'co-postgres-queries/queries/remove';
remove({ table, filterCols, returnCols })(filters);
```

Creates a query to delete rows.

##### Configuration

- table: the table name
- filterCols: the columns that can be used to filter the updated rows
- returnCols: list of columns retrieved by the query

##### Parameters

A literal specifying wanted value for given column
example:

```js
{
    column: 'value'
}
```

will update only row for which column equal 'value'

#### removeOne

```js
import removeOne  from 'co-postgres-queries/queries/removeOne';
removeOne({ table, primaryKey, returnCols })(identitfier);
```

Creates a query to delete one row.

##### Configuration

- table: the table name
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- returnCols: list of columns retrieved by the query

##### Parameters

The identifier: either a single value for a single primaryKey column, or a literal if several columns:`{ id1: value, id2: otherValue }`. All configured primaryKey columns must be given a value.

#### batchRemove

```js
import batchRemove  from 'co-postgres-queries/queries/batchRemove';
batchRemove({ table, primaryKey, returnCols })(identifierList);
```

Allow to create a query to delete several row at once

##### Configuration

- table: the table name
- columns: list of columns to insert
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)

##### Parameters

The list of identifier either an array of single value for a single primaryKey column, or an array of literal if several columns:`[{ id1: value, id2: otherValue }, ...]`. All configured primaryKey columns must be given a value.

#### upsertOne

```js
import upsertOne  from 'co-postgres-queries/queries/upsertOne';
upsertOne({
    table,
    primaryKey,
    writableCols,
    returnCols,
})(row)
```

Creates a query to update one row or create it if it does not already exists.

##### Configuration

- table: the name of the table
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- writableCols: the column that can be updated
- returnCols: the column to return in the result

##### Parameters

the row to upsert

#### batchUpsert

```js
import batchUpsert  from 'co-postgres-queries/queries/batchUpsert';
batchUpsert({
    table,
    primaryKey,
    writableCols,
    returnCols,
})(rows)
```

Creates a query to update a batch row creating those that does not already exists.

##### Configuration

- table: the name of the table in which to upsert
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- writableCols: the column that can be updated
- returnCols: the column to return in the result
- columns: all the columns accepted by the query, default to selectorcolumns + writableCols (no reason to change that)

##### Parameters

The array of rows to upsert

#### selectByOrderedIdentifiers

```js
import selectByOrderedIdentifiers from 'co-postgres-queries/queries/selectByOrderedIdentifiers';
selectByOrderedIdentifiers({
    table,
    primaryKey,
    returnCols,
})(values);
```

Creates a query to select multiple row given an array of identifier. The result will keep the order of the identifier. Due to the nature of the query, this will only work for primaryKey composed of a single column.

##### Configuration

- table: the name of the table in which to upsert
- primaryKey: primaryKey of the table (this will only work with primaryKey of a single column)
- returnCols: the column to return in the result

##### Parameters

The array of identifier to retrieve. The array order will determine the result order.

#### crud

```js
import crud  from 'co-postgres-queries/queries/crud';
crud({
    table,
    writableCols,
    primaryKey,
    returnCols,
});
```

Creates configured queries for insertOne, batchInsert, selectOne, select, updateOne, deleteOne and batchDelete.

##### Configuration

- table: the name of the table.
- primaryKey: One or more columns representing the primary key. Accept either an array or a single value. (default: `id`)
- writableCols: list of columns that can be set
- returnCols: the list of columns we want returned as result.
- searchableCols: the columns that can be searched (usable in filter parameter). Defaults to return columns
- specificSorts:
    allow to specify sort order for a given column. Useful when we want to order string other than by alphabetical order.
    example:
    ```js
    {
        level: ['master', 'expert', 'novice']
    }
    ```
    will order level column with all master first, then expert and finally novice
- groupByCols: allow to add a GROUP BY clause to the query on the given columns
- withQuery:
    specify that we want to encompass the query in `WITH RESULT AS <query> SELECT * FROM result`
    This add a temporary result table that allow to sort on computed and joined column.
    if the table configuration contain a JOIN clause, this will be automatically set to true.

#### transaction helper

```js
import { begin, commit, savepoint, rollback } from 'co-postgres-queries/queries/transaction';
```

Simple helper to manage transaction
You must retrieve a client with `pool.connect()` to use those.

##### begin

```js
import begin from 'co-postgres-queries/queries/transaction/begin';
begin();
// { sql: 'BEGIN' }
```

create a query to start a transaction

##### commit

```js
import commit from 'co-postgres-queries/queries/transaction/commit';
commit();
// { sql: 'COMMIT' }
```

create a query to commit a transaction

##### savepoint

```js
import savepoint from 'co-postgres-queries/queries/transaction/savepoint';
savepoint(name);
// { sql: 'SAVEPOINT name' }
```

create a query to add a save point during transsaction

##### rollback

```js
import rollback from 'co-postgres-queries/queries/transaction/rollback';
rollback();
// { sql: 'ROLLBACK' }
// or
rollback(name);
// { sql: 'ROLLBACK to name' }
```

Rollback the transaction to the given save point, or to its beginning if not specified.
