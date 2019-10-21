---
layout: docs
title: ORM
---

## {{ page.title }}

Typetron's ORM is an [Active Record](https://en.wikipedia.org/wiki/Active_record_pattern) implementation for
interaction with the database. You can define **Entities** for each table in the database and use that to query,
modify and remove records.

Before you get started with the ORM, make sure you [configured the database](/docs/database).


#### Creating an Entity
Every entity is a class inside `Entities` directory that extend `Entity` class under `@Typetron/Database`:
```ts
import { Column, Entity, ID } from '@Typetron/Database';

export class Article extends Entity {
    @Column()
    id: ID;

    @Column()
    title: string;

    @Column()
    content: string;
}
```

By default, Typetron uses the lowercase name of the entity as the table name, which is `article` in this
case. You can change the table name using the `@Meta` decorator:

```ts
@Meta({
    table: 'articles'
})
export class Article extends Entity {
    // ...
}
```

Each property inside the entity that has the `@Column` decorator will map one to one with the table column in
the database. By default, the entity will try to find the columns with the same name as it's properties.
For the `Article` entity above, Typetron will try to find an `articles` table with columns: `id`, `title` and `content`.
You can change the name of the columns that will match from the property by passing it as the first argument
for the `@Column` decorator:

```ts
export class Article extends Entity {
    // ...
    @Column('body')
    content: string;
}
```
This will match the `content` property of the `Article` entity with the `body` column from the `article` table.

#### Getting records
Each entity is like a more powerful version of the [Query Builder](/docs/query-builder) that you can use to
get the data from the database:
```ts
const articles = await Article.get(); // SELECT * FROM `article`
/*
[
  {
    "id": 1,
    "title": "Article one",
    "content": "Content for article one"
  },
  {
    "id": 2,
    "title": "Article two",
    "content": "Content for article two"
  }
]
*/ 
``` 

Each object inside articles array is an instance of the Article entity

You can get specific columns from the database by passing and array of properties to the `.get()` method:

```ts
const articles = await Article.get(['id','title']); // SELECT `title` FROM `article`
/*
[
  {
    "id": 1,
    "title": "Article one"
  },
  {
    "id": 2,
    "title": "Article two"
  }
]
*/ 
``` 

#### Getting one record
If you want to get only one record from the database you may use `.find` or `first` methods from the entity
that will return a single instance of the queried entity:

```ts
const article = await Article.where('title', 'Article one')->first();
{
    "id": 1,
    "title": "Article one",
    "content": "Content for article one"
}
```

The `find` method retrieves one record queried by it's primary key:
```ts
const article = await Article.find(1);
/*
{
    "id": 1,
    "title": "Article one",
    "content": "Content for article one"
}
*/

``` 
The `find` method is a e for:
```ts
const article = await Article.where('id', 1).first(); // 'id' is the default primary key
```  

You can overriding the primary key of an entity by overriding the `.getPrimaryKey()` method:

```ts
export class Article extends Entity{

    getPrimaryKey(){
        return 'article_id';
    }
}
``` 

As with the Query, you can use `.where` methods to filter the entities.

#### Creating records
The `.create` method will create a new entity and save it in the database:
```ts
const article = await Article.create({
    title: 'Fresh article',
    content: 'Fresh content'
})
```
If you just want to create an entity without saving is into the database, you can simply instantiate it using
the data needed and save it later if needed:
```ts
const article = new Article({
    title: 'Fresh article',
    content: 'Fresh content'
})
// ...
await article.save();
```

#### Updating records
To update an entity simply set the needed properties to the required values, then, call the `save` method:

```ts
const article = await Article.find(1);
article.title = 'Updated title';
article.save();
```

If you want to update more fields at a time, you can use the `.fill` method:

```ts
const article = await Article.find(1);
article.fill({
    title: 'Updated title',
    content: 'Updated content'
})
article.save();
```

#### Deleting records
To delete a record you can call the `.delete` method on an entity:
```ts
const article = await Article.find(1);
await article.delete();
```

If you want to delete more records, you can filter the entities and the delete them:
```ts
await Article.where('title', 'Article title').delete();
```

#### Timestamps
Usually, you want your entities to have a date when they were created and a date when they were updated.
This can be done using timestamps that can be activated on each entity. Also, you will have to add the
`createdAt` and `updatedAt` columns in your entity: 
```ts
@Meta({
    timestamps: true,
})
export class Article extends Entity {
    @Column()
    id: ID;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}
```
