#coPostgresQueries
utility to generate and execute postgresql queries with ease.

##pgClient
Allow to cennect to postgres and execute query
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

##insertOne
allow to create insertOne query given table, fields, returnFields.
Return a function asking for a dbConnection.
```js
const insertOneQuery = insertOne('user', ['name', 'firstname'], ['id', 'name', 'firstname'])(db);

const user = yield insertOneQuery({ name: 'doe', firstname: 'john' });
// user = { id: 1, name: 'doe', firstname: 'john' }
```

##crud
generate configured queries for insertOne, batchInsert, selectOne, selectPage, updateOne, deleteOne and batchDelete.
```js
crud(table, fields, idFields, returnFields = ['*'], configurators = []);
```
with table the name of the table.
fields the list of the fields.
idFields the list of the primarykeys.
returnFields the list of fields we want returned as result.

And configurators a list of function that will get executed with the result of the queries, allowing to configure them more precisely.
```js
crud('user', ['name', 'firstname'], ['id'], ['*'], [(queries) => queries.selectPage
    .table('user JOIN town ON user.town = town.id')
    .returnFields([ 'user.name', 'user.firstname', 'town.name' ])
]);
```
