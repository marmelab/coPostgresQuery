#coPostgresQueries
utility to generate and execute postgresql queries with ease.

##Install

`npm install --save co-postgres-queries`


##Introduction
The library can be divided in two parts:
 - The query helpers (insertOne, selectOne, etc..) that allows to generate sql, and the corresponding parameters.
 - PgPool, that allows to connect to the postgres database and execute query.


##Query helper
Each query helper takes the form:
```js
query(...config)(...parameters);
```
On the first call it receives its configuration, eg, the table name, field name, etc...
At this step, the returned function is also configurable.
For example:
```js
const insertOneQuery = insertOneQuery('user', ['name', 'firstname'], ['id', 'name', 'firstname']);
// is the same as
const insertOneQuery = insertOneQuery()
.table('user')
.fields(['name', 'firstname'])
.returnFields(['id', 'name', 'firstname']);
```
On the second call it takes the query parameters and returns an object on the form `{ sql, parameters }`.
With the sql containing named parameter, and parameters having been sanitized based on the configuration.
For example:
```js
insertOneQuery({ name: 'doe', firstname: 'john', other: 'data' });
// would return
{
    sql: 'INSERT INTO user (name, firstname)VALUES($name, $firstname) RETURNING id, name, firstname',
    parameters: { name: 'doe', firstname: 'john' }
}
```
The result can then be directly passed to client.query to be executed.

###insertOne(table, fields, returnFields)(entity)
allow to create a query to insert one given entity.

####Configuration
- table: the table name
- fields: list of fields to insert
- returnFields: list of fields exposed in the result of the query

####Parameters
A literal object in the form of:
```js
{
    fieldName: value,
    ...
}
```

###batchInsert(table, fields, returnFields)(db)(entities)
allow to create a query to insert an array of entities.

####Configuration
- table: the table name
- fields: list of fields to insert
- returnFields: list of fields exposed in the result of the query

####Parameters
An array of literal object in the form of:
```js
[
    {
        fieldName: value,
        ...
    }, ...
]
```

###selectOne(table, idFields, returnFields)(db)(entity)
allow to create a query to select one entity.

####Configuration
- table: the table name
- idFields: list of key fields used to select the entity
- returnFields: list of fields retrieved by the query

####Parameters
A literal in the form of:
```js
{
    id1: value,
    id2: value,
    ...
}
```
key not in idFields will be ignored

###selectPage(table, idFields, returnFields)(db)(limit, offset, filters, sort, sortDir)
allow to create a query to select one entity.

####Configuration
- table:
    the table name, accept JOIN statement
- idFields:
    list of key fields used to select the entity
- returnFields:     
    list of fields retrieved by the query
- searchableFields:
    list field that can be searched (usable in filter parameter) default to return fields
- specificSort:
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

####Parameters
- limit:
    number of result to be returned
- offset
    - number of result to be ignored
- filters
    - literal specifying wanted value for given field
    example:
    ```js
    {
        field: 'value'
    }
    ```
    will return only entity for which entity.field equal 'value'
- sort:
    Specify the field by which to filter the result (Additionally the result will always get sorted by the entity identifiers to avoid random order)
- sortDir
    Specify the sort direction either 'ASC' or 'DESC'

###updateOne(table, updatableFields, idFields, returnFields)(db)(ids, data)
allow to create a query to update one entity.

####Configuration
 - table: the table name
 - updatableFields: the fields that can be updated
 - idFields: the fields used to select the target entity
 - returnFields: the fields to be returned in the result

####Parameters
 - ids: the ids values accept either a single value for a single id, or a literal for several id:`{ id1: value, id2: otherValue }`
 - data: a literal specifying the field to update

###deleteOne(table, idFields, returnFields)(db)(ids)
allow to create a query to delete one entity.

####Configuration
- table: the table name
- idFields: list of key fields used to select the entity
- returnFields: list of fields retrieved by the query

####Parameters
 - ids: either a literal with all ids value, or a single value if there is only one id

###batchDelete(table, fields, identifier)(db)(ids)
Allow to create a query to delete several entity at once

####configuration
 - table: the table name
 - fields: list of fields to insert
 - identifier: the field used to select the entity to delete

####Parameters
 - ids: list of ids of the entity to delete

###upsertOne(table, selectorFields, updatableFields, autoIncrementFields, returnFields)(db)(entity)
Allow to create a query to update one entity or create it if it does not already exists.

####configuration
 - table: the name of the table
 - selectorFields: the field used to select one entity checking if it exists
 - updatableFields: the field that can be updated
 - autoIncrementFields: the auto increment field that should not get updated
 - returnFields: the field to return in the result
 - fields: all the fields accepted by the query, default to selectorFields + updatableFields (no reason to change that)
 - insertFields: all the fields minus the autoIncrementFields (no reason to change that)

####Parameters
 - entity: the entity to upsert

###batchUpsert(table, selectorFields, updatableFields, returnFields)(db)(entities)
Allow to create a query to update a batch entity creating those that does not already exists.

####configuration
 - table: the name of the table in which to upsert
 - selectorFields: the field used to select one entity checking if it exists
 - updatableFields: the field that can be updated
 - returnFields: the field to return in the result
 - fields: all the fields accepted by the query, default to selectorFields + updatableFields (no reason to change that)

####Parameters
- entities: array of entities to upsert

###selectByFieldValues(table, selectorField, returnFields)(db)(values)
Allow to create a query to select an entity with selectorField IN values and keep the ORDER of values.

####configurations
 - table: the name of the table in which to upsert
 - selectorField: the field used to select entity
 - returnFields: the field to return in the result
####Parameters
 - values: array of values to retrieve. The array order will determine the result order.
 Careful, if several entity share the same value, their order is unpredictable.

###crud(table, fields, idFields, returnFields, configurators )(db)
generate configured queries for insertOne, batchInsert, selectOne, selectPage, updateOne, deleteOne and batchDelete.

####configuration
 - table: the name of the table.
 - fields: the list of the fields.
 - idFields: the list of the primarykeys.
 - returnFields: the list of fields we want returned as result.
 - configurators: a list of function that will get executed with the result of the queries, allowing to configure them more precisely.
```js
crud('user', ['name', 'firstname'], ['id'], ['*'], [(queries) => queries.selectPage
    .table('user JOIN town ON user.town = town.id')
    .returnFields([ 'user.name', 'user.firstname', 'town.name' ])
]);
```

##PgPool
Extend [node-pg-pool](https://github.com/brianc/node-pg-pool)
Allow to connect to postgresql and execute query
It adds:
 - Support for named parameter.
 - query: Now return the list of results.
 - Added queryOne: Same as query but return only one result, instead of an array.
 - Helper method ([begin, savepoint, rollback, commit][###client.begin, client.commit, client.savepoint, client.rollback]) to handle transactions on the client.
 - Helper method ([link][### client.link]) to link a query helper to the client or pool.

###Creating a pool:
```js
import { PgPool } from 'co-postgres-queries';
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

###Getting client with promise
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
```js
// query use named parameter
client.query({
    sql: 'SELECT $name::text as name',
    parameters: { name: 'world' }
}) // query return a promise
.then((result) => {
    // result contain directly the row
    console.log(`Hello ${result[0].name}`);
});

// It work with asyn/await
(async() => {
    const pool = new PgPool();
    const result = await pool.query({
        sql: 'SELECT $name::text as name',
        parameters: { name: 'world' }
    });

    console.log(`Hello ${result[0].name}`);
})()
// Or with co
co(function* () {
    const pool = new PgPool();
    const result = yield pool.query({
        sql: 'SELECT $name::text as name',
        parameters: { name: 'world' }
    });

    console.log(`Hello ${result[0].name}`);
});
```

### pool.query
You can also execute a query directly from the pool.
A client will then get automatically retrieved, and released once the query is done.
Transactions are not possible this way since the client would change on each query.

###client.queryOne
Same as query but returns only the first result or null

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

###client.release
Return the client to the pool, to be used again.
Do not forget to call this when you are done.

### client.end
Close the client. It will not return to the pool.

###client.begin, client.commit, client.savepoint, client.rollback
Allow to manage transaction
You must retrieve a client with `pool.connect()` to use those.
