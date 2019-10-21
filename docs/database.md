---
layout: docs
title: Database
---

## {{ page.title }}

Typetron provides an easy way to interact with a database using the Query Builder or the ORM. At this moment 
Typetron supports only SQLite as it's driver(for prototyping purposes) but it will have support for major SQL
and NoSQL databases as well. 

In order to get started, you will have to create a `database.sqlite` file in your project's directory that
will be used by the sqlite driver. Then update the `config/database.ts` config file with the name of the
database file you've just created:

```ts
import { DatabaseConfig } from '@Typetron/Database';

export default new DatabaseConfig({
    database: './database.sqlite'
});
```

This will open a SQLite connection between the app and the `.sqlite` file. 

Check the [Query Builder](/docs/query-builder) to know how to get started to interact with a database. 
