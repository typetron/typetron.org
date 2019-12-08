---
layout: tutorials
title: Database
---

## {{ page.title }}

The next thing we have to do is to show the user a list of articles. But we need to store that data somewhere.
Open `database.slite` file in your favorite SQL editor and create the `users` and `articles` tables to store
our data:
```sqlite
create table articles
(
	id integer constraint post_pk primary key autoincrement,
	title varchar(128) not null,
	content text,
	createdAt datetime not null
);
create table users
(
	id integer constraint user_pk primary key autoincrement,
	email varchar(128) not null,
	name varchar(128),
	password varchar not null
);

create unique index user_email_uindex on users (email);
```
> **_NOTE_** For the time being, Typetron supports only SQLite databases but in the future it will support most
> of the SQL and NoSQL database like: MySQL, PostgreSQL, Mongodb, DynamoDB etc.

Also, fill the tables with some data:
```sqlite
INSERT INTO articles (id, title, content, createdAt) VALUES 
    (1, 'Making a blog with Typetron', 'Content here', '1571521593000'),
    (2, 'Making a healthy breakfast', 'Content here too', '1571518725000'),
    (3, 'Why going to gym is good', 'Content here more', '1571518724000'),
```
> **_NOTE_** Typetron will have a auto-seeding tool that you can use to populate your database with random data. 

#### Creating the `Article` entity

Now, since we have our database ready, we can go back to our TypetronBlog app and write some code. First of all,
we need to create the entities that we will work with. An Entity is a special class that resembles am entry in
our database. In this case we have two tables: `users` and `articles`, so we need two entities. Luckily,
Typetron comes with an User entity already in the app which is located inside `Entities` directory. We only
need to create the `Article` Entity by creating an `Article.ts` file inside Entities folder and write this:  
```ts
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
> added, the Article entity will select from the `article` table. You can use singular names for tables if you 
> don't want to use the @Meta decorator. In the future Typetron will have a pluralization feature and you won't
> need to write the table at plural manually.

In the next part we will create the basic action to create, update and delete articles. >>>>>> [Database](/tutorials/crud).
