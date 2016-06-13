#coPostgresQueries
utility to generate and execute postgresql queries with ease.

##pgClient
Allow to connect to postgres and execute query
```js
import { pgCLient } from 'coPostgresQueries';
const db = new pgClient(dsn);
yield db.query({ sql, parameters });
```
return db object
###db.query
execute given query in the form of:
```js
{
    sql: 'SELECT * FROM user where username=$username;',
    parameters: {
        username: 'john'
    }
}
```
it use named parameter
It always return an array

###db.queryOne
same as query but return only the first result or null

###db.begin, db.commit, db.savepoint, db.rollback
Allow to manage transaction

###db.done
return current connection to the pool, or close it if passed an argument.

##queries
Each queries take the form:
```js
query(...config)(db)(...parameters);
```
On the first call it receive it's configuration, eg, the table name, field name, etc...
At this step, the returned function is also configurable.
For example:
```js
const insertOneQuery = insertOne('user', ['name', 'firstname'], ['id', 'name', 'firstname']);
// is the same as
const insertOneQuery = insertOne().table('user').fields(['name', 'firstname']).returnFields(['id', 'name', 'firstname']);
```
On the second call, it take a dbConnection `const db = new pgCLient(dsn);`, this allow configure the query once for multiple connection.
On the third call it take the query parameters.

###insertOne(table, fields, returnFields)(db)(entity)
allow to create a query to insert one given entity.
####Configuration
- table: the table name
- fields: list of fields to insert
- returnFields: list of fields exposed in the result of the query
####parameters
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
####parameters
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
####parameters
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
####parameters
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
####parameters
 - ids: the ids values accept either a single value for a single id, or a literal for several id:`{ id1: value, id2: otherValue }`
 - data: a literal specifying the field to update

###deleteOne(table, idFields, returnFields)(db)(ids)
allow to create a query to delete one entity.
####Configuration
- table: the table name
- idFields: list of key fields used to select the entity
- returnFields: list of fields retrieved by the query
####parameters
 - ids: either a literal with all ids value, or a single value if there is only one id

###batchDelete(table, fields, identifier)(db)(ids)
Allow to create a query to delete several entity at once
####configuration
 - table: the table name
 - fields: list of fields to insert
 - identifier: the field used to select the entity to delete
####parameters
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
####parameters
 - entity: the entity to upsert

###batchUpsert(table, selectorFields, updatableFields, returnFields)(db)(entities)
Allow to create a query to update a batch entity creating those that does not already exists.
####parameters
 - table: the name of the table in which to upsert
 - selectorFields: the field used to select one entity checking if it exists
 - updatableFields: the field that can be updated
 - returnFields: the field to return in the result
 - fields: all the fields accepted by the query, default to selectorFields + updatableFields (no reason to change that)

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
