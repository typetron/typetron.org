---
layout: docs

title: Query Builder
---

## {{ page.title }}

The query builder provides a set of methods to build queries for the database. Before you get started with the
Query Builder, make sure you [configured the database](/docs/database).

### Select
---
##### Select everything
```ts
const users = await Query.table('users').get()
// SELECT * FROM `users`
```

##### Select specific columns
```ts
const users = await Query.table('users').select(['name', 'email'])
// SELECT `name`, `email` FROM `users`
```

##### Select distinct values
```ts
const users = await Query.table('users').distinct().select(['name', 'email'])
// SELECT DISTINCT `name`, `email` FROM `users`
```

### Where
---
```ts
const users = await Query.table('users').where('name', '=', 'John')
// SELECT * FROM `users` WHERE `name` = ?
```
As you can see, the Query Builder creates prepared statements in order to avoid [SQL Injection](https://en.wikipedia.org/wiki/SQL_injection).

If you want to create a where statements that compares the values with the `equal`, you can use the shorter
version of the `where` method:
```ts
const users = await Query.table('users').where('name', 'John')
// SELECT * FROM `users` WHERE `name` = ?
```

#### Other *WHERE* statements:
```ts
const users = Query.table('users').where('name', 'John').orWhere('age', 21)
// SELECT * FROM `users` WHERE `name` = ? OR `age` = ?
```
```ts
const users = Query.table('users').whereBetween('age', [18, 25])
// SELECT * FROM `users` WHERE `age` BETWEEN ? AND ?   
```
```ts
const users = Query.table('users').whereNotBetween('age', [18, 25])
// SELECT * FROM `users` WHERE `age` NOT BETWEEN ? AND ?
```
```ts
const users = Query.table('users').where('name', 'John').orWhereBetween('age', [18, 25])
// SELECT * FROM `users` WHERE `name` = ? OR `age` BETWEEN ? AND ?
```
```ts
const users = Query.table('users').where('name', 'John').orWhereNotBetween('age', [18, 25])
// SELECT * FROM `users` WHERE `name` = ? OR `age` NOT BETWEEN ? AND ?
```
```ts
const users = Query.table('users').whereIn('age', [18, 25])
// SELECT * FROM `users` WHERE `age` IN (?, ?)   
```
```ts
const users = Query.table('users').whereNotIn('age', [18, 25])
// SELECT * FROM `users` WHERE `age` NOT IN (?, ?)
```
```ts
const users = Query.table('users').where('name', 'John').orWhereIn('age', [18, 25])
// SELECT * FROM `users` WHERE `name` = ? OR `age` IN (?, ?)
```
```ts
const users = Query.table('users').where('name', 'John').orWhereNotIn('age', [18, 25])
// SELECT * FROM `users` WHERE `name` = ? OR `age` NOT IN (?, ?)   
```
```ts
const users = Query.table('users').whereNull('age')
// SELECT * FROM `users` WHERE `age` IS NULL
```
```ts
const users = Query.table('users').whereNotNull('age')
// SELECT * FROM `users` WHERE `age` IS NOT NULL
```
```ts
const users = Query.table('users').where('name', 'John').orWhereNull('age')
// SELECT * FROM `users` WHERE `name` = ? OR `age` IS NULL   
```
```ts
const users = Query.table('users').where('name', 'John').orWhereNotNull('age')
// SELECT * FROM `users` WHERE `name` = ? OR `age` IS NOT NULL
```


### Insert
---
Inserting one row
```ts
Query.table('users').insert({
            name: 'John',
            email: 'john@example.com'
        })
// INSERT INTO `users` (`name`, `email`) VALUES (?, ?)
```
Inserting many rows
```ts
Query.table('users').insert([
            {
                name: 'John',
                email: 'john@example.com'
            },
            {
                name: 'Chris',
                email: 'chris@example.com'
            }
        ])
// INSERT INTO `users` (`name`, `email`) VALUES (?, ?), (?, ?)
```
### Update
---
Update single column
```ts
Query.table('users').update('name', 'John')
// UPDATE `users` SET `name` = ?
```
Update multiple columns
```ts
Query.table('users').update({
            name: 'John',
            age: 21,
        })
// UPDATE `users` SET `name` = ?, `age` = ?
```

Conditional update
```ts
Query.table('users').where('name', 'John').update('name', 'Doe')
// UPDATE `users` SET `name` = ? WHERE `name` = ?
```

### Delete
---
Delete entire table
```ts
Query.table('users').delete()
// DELETE FROM `users`
```

Delete specific rows
```ts
Query.table('users').where('name', 'John').delete()
// DELETE FROM `users` WHERE `name` = ?
```
