---
layout: docs

title: ORM
---

## {{ page.title }}

Typetron's ORM is an [Active Record](https://en.wikipedia.org/wiki/Active_record_pattern) implementation used to easily
interact with the database. You can define **Entities** for each table in the database and use that to query, modify and
remove records. Entities are classes that extend the _Entity_ class from _@Typetron/Database_

Before you get started with the ORM, make sure you [configured the database](/docs/database).

#### Creating an Entity

Every entity class is a file inside the _Entities_ directory:

```ts
import { Column, Entity, ID, PrimaryColumn } from '@Typetron/Database'

export class Article extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    title: string

    @Column()
    content: string
}
```

> **_NOTE_** Typetron will support auto-migrations that will help you create the database schema automatically
> from your entities and then export a migration once you are finished with your changes. This wil become handy
> when working on a development environment.

By default, Typetron uses the lowercase name of the entity as the table name, which is _article_ in this case. You can
change the table name using the _@Options_ decorator:

> **_NOTE_** Typetron will have a pluralization feature, so you won't need to write the table at plural manually.

```ts
import { Column, Entity, ID, Options, PrimaryColumn } from '@Typetron/Database'

@Options({
    table: 'articles',
})
export class Article extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    title: string

    @Column()
    content: string
}
```

Each property inside the entity that has the _@Column_ decorator will map one to one with the table column in the
database. By default, the entity will try to find the columns with the same name as it's properties. For the _Article_
entity above, Typetron will try to find table called _articles_ with columns: _id_, _title_ and _content_. You can
change the name of the columns that will match from the property by passing it as the first argument for the _@Column_
decorator:

```ts
@Options({
    table: 'articles'
})
export class Article extends Entity {
    // ...
    @Column('body')
    content: string
}
```

This will match the _content_ property of the _Article_ entity with the _body_ column from the _articles_ table.

#### Getting records

Each entity is like a more powerful version of the [Query Builder](/docs/query-builder) that you can use to get the data
from the database:

```ts
const articles = await Article.get() // SELECT * FROM `article`
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

You can get specific columns from the database by passing and array of properties to the _.get()_ method:

```ts
const articles = await Article.get(['id', 'title']) // SELECT `title` FROM `article`
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

If you want to get only one record from the database you may use _.find_ or _first_ methods from the entity that will
return a single instance of the queried entity:

```ts
const article = await Article.where('title', 'Article one').first()
/*
{
    "id": 1,
    "title": "Article one",
    "content": "Content for article one"
}
*/
```

The _find_ method retrieves one record queried by its primary key:

```ts
const article = await Article.find(1)
/*
{
    "id": 1,
    "title": "Article one",
    "content": "Content for article one"
}
*/

``` 

The _find_ method is similar to:

```ts
const article = await Article.where('id', 1).first() // 'id' is the default primary key
```  

You can override the primary key of an entity by overriding the _getPrimaryKey()_ method:

```ts
export class Article extends Entity {

    getPrimaryKey() {
        return 'article_id'
    }
}
``` 

This will make the _find_ method use the _article_id_ column instead of the default _id_ one.

#### Creating records

The _.create_ method will create a new entity and save it in the database:

```ts
const article = await Article.create({
    title: 'Fresh article',
    content: 'Fresh content'
})
```

If you just want to create an entity without saving is into the database, you can simply instantiate it using the data
needed and save it later if needed:

```ts
const article = new Article({
    title: 'Fresh article',
    content: 'Fresh content'
})
// ...
await article.save()
```

#### Updating records

To update an entity simply set the needed properties to the required values, then, call the _save_ method:

```ts
const article = await Article.find(1)
article.title = 'Updated title'
await article.save()
```

If you want to update more fields at a time, you can use the _.fill_ method:

```ts
const article = await Article.find(1)
article.fill({
    title: 'Updated title',
    content: 'Updated content'
})
await article.save()
```

#### Deleting records

To delete a record you can call the _.delete_ method on an entity:

```ts
const article = await Article.find(1)
await article.delete()
```

If you want to delete more records, you can filter the entities and then delete them:

```ts
await Article.where('title', 'Article title').delete()
```

#### Timestamps

Usually, you want your entities to have a date when they were created, and a date when they were updated. This can be
done using the _@CreatedAt_ and/or _@UpdatedAt_ decorators for date columns in your entity:

```ts
import { Column, CreatedAt, Entity, ID, PrimaryColumn, UpdatedAt } from '@Typetron/Database'

export class Article extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    title: string

    @Column()
    content: string

    @CreatedAt()
    createdAt: Date

    @UpdatedAt()
    updatedAt: Date
}
```

#### Relationships

##### One to One

A one-to-one relationship is a very simple relationship between two entities. We can define this relationship using
the _HasOne_ type on a property on our main entity, followed by its inverse using _BelongsTo_ type on our child entity.
Here is an example:

```ts
import { BelongsTo, Column, Entity, HasOne, ID, PrimaryColumn, Relation } from '@Typetron/Database'

export class User extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    name: string

    @Relation(() => Laptop, 'user')
    laptop: HasOne<Laptop>
}

class Laptop extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    name: string

    @Relation(() => User, 'laptop')
    user: BelongsTo<User>
}

```

We can get the value of this relationship by accessing the _laptop_ property of a user:
```ts
const user = await User.find(1)
const laptop = await user.laptop.get()
```

##### One to Many

This relationship is used when a parent entity can have one or more child entities. For example, a car make can have one
or more car models:

```ts
import { BelongsTo, Column, Entity, HasMany, Relation } from '@Typetron/Database'

export class Make extends Entity {
    @Column()
    name: string

    @Relation(() => Model, 'make')
    models: HasMany<Model>
}

export class Model extends Entity {
    @Column()
    name: string

    @Relation(() => Make, 'models')
    make: BelongsTo<Make>
}
```

We can get the value of this relationship by accessing the _models_ property of a car make:
```ts
const make = await Make.find(1)
const models = await make.models.get()
```


##### Many to Many
This is the most complex relationship of them all because it also requires an additional database table. For example, a
user can have many roles attached to it, but also, a role can be attached to many users. We can define the relationship
like this:

```ts
import { BelongsToMany, Column, Entity, Relation } from '@Typetron/Database'

export class User extends Entity {
    @Column()
    name: string

    @Relation(() => Role, 'users')
    roles: BelongsToMany<Role>
}

export class Role extends Entity {
    @Column()
    name: string

    @Relation(() => User, 'roles')
    users: BelongsToMany<User>
}
```

We can get the roles of a user in the same manner as before:


```ts
const user = await User.find(1)
const roles = await user.roles.get()
```
