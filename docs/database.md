---
layout: docs

title: Database
---

## {{ page.title }}

Typetron provides an easy way to interact with a database using the Query Builder or the ORM. At this moment Typetron
supports only SQLite as its driver(for prototyping purposes), but it will have support for major SQL and NoSQL databases
as well.

In order to get started, you will have to create a _database.sqlite_ file in your project's directory(if it's not
created already) that will be used by the sqlite driver. Then update the _config/database.ts_ config file with the name
of the database file you've just created:

```ts
import { DatabaseConfig } from '@Typetron/Framework'

export default new DatabaseConfig({
    database: 'database.sqlite',
    entities: './Entities',
    synchronizeSchema: true,
})
```

This will open a SQLite connection between the app and the _database.sqlite_ file.

By default, Typetron has the _synchronizeSchema_ feature activate. This feature will synchronize all of your entities
with your database. This feature should be used only in the development environment for rapid prototyping and should be
deactivated (_synchronizeSchema: false_) in production environments.

Check the [Query Builder](/docs/query-builder) to know how to get started to interact with a database. 
