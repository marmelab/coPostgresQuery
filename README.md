# coPostgresQueries

utility to generate and execute postgresql queries with ease.

## Install

`npm install --save co-postgres-queries`


## Introduction

The library can be divided in two parts:

- The query helpers (insertOne, selectOne, etc..) that allow to generate sql, and the corresponding parameters.
- PgPool, that allows to connect to the postgres database and execute query.


## Query helper

Each query helper takes the form:

```js
query(config)(...parameters);
```

On the first call it receives its configuration, eg, the table name, field name, etc...
For example:

```js
import insertOneQuery  from 'co-postgres-queries/queries/insertOne';
const insertOne = insertOneQuery({
    table: 'user',
    fields: ['name', 'firstname'],
    returnFields: ['id', 'name', 'firstname'],
});
```

On the second call it takes the query parameters and returns an object of the form `{ sql, parameters }`,
with the sql containing named parameter, and parameters having been sanitized based on the configuration.
For example:

```js
insertOneQuery({ name: 'doe', firstname: 'john', other: 'data' });
// would return
{
    sql: 'INSERT INTO user (name, firstname)VALUES($name, $firstname) RETURNING id, name, firstname',
    parameters: { name: 'doe', firstname: 'john' }
}
```

The result can then be directly passed to `client.query` to be executed.

### insertOne

```js
import insertOne  from 'co-postgres-queries/queries/insertOne';
insertOne({ table, fields, returnFields })(db)(entity)
```

Returns a query to insert one given entity.

#### Configuration

- table: the table name
- fields: list of fields to insert
- returnFields: list of fields exposed in the result of the query

#### Parameters

A literal object in the form of:

```js
{
    fieldName: value,
    ...
}
```

### batchInsert(table, fields, returnFields)(db)(entities)

allow to create a query to insert an array of entities.

#### Configuration

- table: the table name
- fields: list of fields to insert
- returnFields: list of fields exposed in the result of the query

#### Parameters

An array of literal objects in the form of:

```js
[
    {
        fieldName: value,
        ...
    }, ...
]
```

### selectOne

```js
import selectOne  from 'co-postgres-queries/queries/selectOne';
selectOne({ table, idFields, returnFields })(db)(entity)
```

Creates a query to select one entity.

#### Configuration

- table: the table name
- idFields: list of key fields used to select the entity (default: `id`)
- returnFields: list of fields retrieved by the query

#### Parameters

A literal in the form of:

```js
{
    id1: value,
    id2: value,
    ...
}
```

Any key not present in idFields will be ignored.

### selectPage

```js
import selectPage  from 'co-postgres-queries/queries/selectPage';
selectPage({
    table,
    idFields,
    returnFields,
    searchableFields,
    specificSorts,
    groupByFields,
    withQuery,
})(db)({ limit, offset, filters, sort, sortDir });
```

Creates a query to select one entity.

#### Configuration

- table:
    the table name, accept JOIN statements
- idFields:
    list of key fields used to select the entity (default: `id`)
- returnFields:
    list of fields retrieved by the query
- searchableFields:
    list of fields that can be searched (usable in filter parameter). Defaults to return fields
- specificSorts:
    allow to specify sort order for a given field. Useful when we want to order string other than by alphabetical order.
    example:
    ```js
    {
        level: ['master', 'expert', 'novice']
    }
    ```
    will order level field with all master first, then expert and finally novice
- groupByFields
    allow to add a GROUP BY clause to the query on the given fields
- withQuery
    specify that we want to encompass the query in `WITH RESULT AS <query> SELECT * FROM result`
    This add a temporary result table that allow to sort on computed and joined field.
    if the table configuration contain a JOIN clause, this will be automatically set to true.

#### Parameters

- limit:
    number of results to be returned
- offset:
    number of results to be ignored
- filters
    literal specifying wanted value for given field
    example:
    ```js
    {
        field: 'value'
    }
    ```
    will return only entity for which entity.field equal 'value'
- sort:
    Specify the field by which to filter the result (Additionally the result will always get sorted by the entity identifiers to avoid random order)
- sortDir:
    Specify the sort direction, either 'ASC' or 'DESC'

### updateOne

```js
import updateOne  from 'co-postgres-queries/queries/updateOne';
updateOne({
    table,
    updatableFields,
    idFields,
    returnFields,
    allowPrimaryKeyUpdate,
})(db)(ids, data);
```

Creates a query to update one entity.

#### Configuration

- table: the table name
- updatableFields: the fields that can be updated
- idFields: the fields used to select the target entity (default: `id`)
- returnFields: the fields to be returned in the result
- allowPrimaryKeyUpdate: if true allows to update primary keys value

#### Parameters

- ids: either a single value for a single id, or a literal for several id:`{ id1: value, id2: otherValue }`
- data: a literal specifying the field to update

### deleteOne

```js
import deleteOne  from 'co-postgres-queries/queries/deleteOne';
deleteOne({ table, idFields, returnFields })(db)(ids);
```

Creates a query to delete one entity.

#### Configuration

- table: the table name
- idFields: list of key fields used to select the entity (default: `id`)
- returnFields: list of fields retrieved by the query

#### Parameters

- ids: either a single value for a single id, or a literal for several id:`{ id1: value, id2: otherValue }`

### batchDelete(table, fields, identifier)(db)(ids)

Allow to create a query to delete several entity at once

#### Configuration

- table: the table name
- fields: list of fields to insert
- identifier: the field used to select the entity to delete

#### Parameters

- ids: list of ids of the entity to delete

### upsertOne

```js
import upsertOne  from 'co-postgres-queries/queries/upsertOne';
upsertOne({
    table,
    idFields,
    updatableFields,
    returnFields,
})(db)(entity)
```

Creates a query to update one entity or create it if it does not already exists.

#### Configuration

- table: the name of the table
- idFields: the field used to select one entity checking if it exists (default: `id`)
- updatableFields: the field that can be updated
- autoIncrementFields: the auto increment field that should not get updated
- returnFields: the field to return in the result
- fields: all the fields accepted by the query, default to selectorFields + updatableFields (no reason to change that)
- insertFields: all the fields minus the autoIncrementFields (no reason to change that)

#### Parameters

- entity: the entity to upsert

### batchUpsert

```js
import batchUpsert  from 'co-postgres-queries/queries/batchUpsert';
batchUpsert({
    table,
    idFields,
    updatableFields,
    returnFields,
})(db)(entities)
```

Creates a query to update a batch entity creating those that does not already exists.

#### Configuration

- table: the name of the table in which to upsert
- selectorFields: the fields used to select entity and determine if it must be updated or created.
- updatableFields: the field that can be updated
- returnFields: the field to return in the result
- fields: all the fields accepted by the query, default to selectorFields + updatableFields (no reason to change that)

#### Parameters

- entities: array of entities to upsert

### selectByOrderedFieldValues(table, selectorField, returnFields)(db)(values)

Creates a query to select an entity with selectorField IN values and keep the ORDER of values.

#### Configuration

- table: the name of the table in which to upsert
- selectorField: the field used to select entity
- returnFields: the field to return in the result

#### Parameters

- values: array of values to retrieve. The array order will determine the result order.

Careful, if several entity share the same value, their order is unpredictable.

### transaction helper

Simple helper to manage transaction
You must retrieve a client with `pool.connect()` to use those.

#### begin

```js
begin()();
// { sql: 'BEGIN' }
```

create a query to start a transaction

#### commit

```js
commit()();
// { sql: 'COMMIT' }
```

create a query to commit a transaction

#### savepoint

```js
savePoint(name);
// { sql: 'SAVEPOINT name' }
```

create a query to add a save point during transsaction

#### rollback

```js
rollback();
// { sql: 'ROLLBACK' }
// or
rollback(name);
// { sql: 'ROLLBACK to name' }
```

Rollback the transaction to the given save point, or to its beginning if not specified.

### crud

```js
import crud  from 'co-postgres-queries/queries/crud';
crud({
    table,
    fields,
    idField,
    returnFields,
})(db)
```

Creates configured queries for insertOne, batchInsert, selectOne, selectPage, updateOne, deleteOne and batchDelete.

#### Configuration

- table: the name of the table.
- fields: the list of the fields.
- idField: the field where we want to search the values (default: `id`)
- returnFields: the list of fields we want returned as result.
- updatableFields: the fields that can be updated
- searchableFields: the fields that can be searched (usable in filter parameter). Defaults to return fields
- specificSorts:
    allow to specify sort order for a given field. Useful when we want to order string other than by alphabetical order.
    example:
    ```js
    {
        level: ['master', 'expert', 'novice']
    }
    ```
    will order level field with all master first, then expert and finally novice
- groupByFields: allow to add a GROUP BY clause to the query on the given fields
- withQuery:
    specify that we want to encompass the query in `WITH RESULT AS <query> SELECT * FROM result`
    This add a temporary result table that allow to sort on computed and joined field.
    if the table configuration contain a JOIN clause, this will be automatically set to true.

## PgPool

Extend [node-pg-pool](https://github.com/brianc/node-pg-pool)
Allow to connect to postgresql and execute query
It adds:

- Support for named parameters.
- query: Now return the list of results.
- Added queryOne: Same as query but return only one result instead of an array.
- Helper method ([begin, savepoint, rollback, commit][###client.begin, client.commit, client.savepoint, client.rollback]) to handle transactions on the client.
- Helper method ([link][### client.link]) to link a query helper to the client or pool.

### Creating a pool

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

### Getting client with promise

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

### client.query

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

### pool.query

You can also execute a query directly from the pool.
A client will then get automatically retrieved, and released once the query is done.
Transactions are not possible this way since the client would change on each query.

### client.link

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

### client.release

Return the client to the pool, to be used again.
Do not forget to call this when you are done.

### client.end

Close the client. It will not return to the pool.

### client.saga

Take a generator yielding object queries (`{ sql, parameters }`), and return an async function that run the generator executing the yielded query.

```js
const getUserAndDoSomethig = client.saga(function* (id) {
    const user = yield {
        sql: 'SELECT * FROM user WHERE $id=id',
        parameters: { id },
        returnOne: true,
    };
    ...
});

getUserAndDoSomething(5).then(...);
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
