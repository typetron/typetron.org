---
layout: docs

title: Database
---

## {{ page.title }}

Your app might need to connect to a database. Typetron provides an easy way to interact with a database using the Query
Builder or the ORM. At this moment Typetron supports only SQLite(for prototyping purposes) and MySQL as its drivers, but
it will have support for major SQL and NoSQL databases as well in the future.

By default, Typetron has a SQLite connection setup that you can see in the _config/database.ts_:

```ts
import { DatabaseConfig } from '@Typetron/Framework'
import { SqliteDriver } from '@Typetron/Database/Drivers'

export default new DatabaseConfig({

    driver: new SqliteDriver('database.sqlite'),
    // driver: new MysqlDriver({host: 'host', user: 'user', password: 'password', database: 'database'}),

    entities: './Entities',

    synchronizeSchema: true,

    migrationsDirectory: 'migrations'
})
```

This SQLite connection connects to the _database.sqlite_ file in your project. You can also use the MySQL driver to
connect to a MySQL database by providing the proper connection options

#### Schema synchronization

By default, Typetron has the _synchronizeSchema_ feature activate. This feature will synchronize all of your entities
with your database everytime you make a change to them. This feature should be used only in the development environment
for rapid prototyping and should be deactivated (_synchronizeSchema: false_) in production environments.

Check the [Query Builder](/docs/query-builder) to know how to get started to interact with a database. 
