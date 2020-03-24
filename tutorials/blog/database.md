---
layout: tutorial
title: Database
---

## {{ page.title }}

The next thing we have to do is to show our visitors a list of articles. But we need to store that data somewhere.
Right now, since Typetron is not event in version 1, it offers support only for SQLite databases (file based database).
But don't worry. Typetron will support most of the popular SQL and NoSQL (MySQL, PostgreSQL, Mongodb, DynamoDB etc) 
databases before version 1 release. For now, let's just work with SQLite and get some features up and running.
 
Open the _database.slite_ file in your favorite SQL editor and create the _articles_ table to store our data:
```sql
create table articles
(
	id integer constraint article_pk primary key autoincrement,
	title varchar(128) not null,
	content text,
	createdAt datetime not null,
	updatedAt datetime not null
);
```

Also, fill the tables with some data:
```sql
INSERT INTO articles (title, content, createdAt, updatedAt) VALUES 
    ('Ultimate Crispy "Chicken" Sandwich', 'Content here', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Chunky Monkey Smoothie Bowls', 'Content here too', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Chicken chunks with green chunks', 'Content here more', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
```
> **_NOTE_** Typetron will have an auto-seeding tool that you can use to populate your database with random data. 

#### Creating the `Article` entity

Now, since we have our database ready, we can go back to our TypetronBlog app and write some code. First of all,
we need to create the entities that we will work with. An Entity is a special class that resembles an entry in
our database. In this case we have the _articles_ table, so we need to create the _Article_ entity by creating an
_Article.ts_ file inside Entities folder and write this:  
```ts
import { Column, Entity, ID, Meta } from '@Typetron/Database';

@Meta({
    table: 'articles'
})
export class Article extends Entity {
    @Column()
    id: ID;
    
    @Column()
    title: string;
    
    @Column()
    content: string;
}  
```

>  **_NOTE_** Typetron will support auto-migrations that will help you create the database schema automatically
> from your entities and then export a migration once you are finished with your changes. This wil become handy
> when working on a development environment.

>  **_NOTE_** By default, Typetron will use the entity's name to connect to the table. Without the table value
> added, the Article entity will select from the _article_ table. You can use singular names for tables if you 
> don't want to use the @Meta decorator. In the future Typetron will have a pluralization feature and you won't
> need to write the table at plural manually.


Let's also add timestamp fields to know when the article was created or updated:
```ts
import { Column, Entity, ID, Meta, CreatedAt, UpdatedAt } from '@Typetron/Database';

@Meta({
    table: 'articles',
})
export class Article extends Entity {
    @Column()
    id: ID;

    @Column()
    title: string;

    @Column()
    content: string;

    @CreatedAt()
    createdAt: Date;

    @UpdatedAt()
    updatedAt: Date;
}
```

The _createdAt_ and _updatedAt_ fields will be automatically populated with their respective values when an Entity
is created or updated because they were annotated with the _@CreatedAt()_ and the _@UpdatedAt()_ decorators. 

In the next part we will add the basic actions to create, update and delete articles. >>>>>> [Managing articles](crud).
