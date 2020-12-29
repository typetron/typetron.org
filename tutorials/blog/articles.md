---
layout: blog

title: Articles
---

## {{ page.title }}

The next thing we have to do is to show our visitors a list of articles, and we need to store that data somewhere. Right
now, since Typetron is not event in version 1, it offers support only for SQLite databases (file based database).
Typetron will support most of the popular SQL and NoSQL (MySQL, PostgreSQL, Mongodb, DynamoDB etc)
databases before version 1 release. For now, let's just work with SQLite and get some features up and running.

#### Creating the `Article` entity

In order to easily work with the database, we have to create entities for the tables in our app. These entities are
simple classes with special decorators that will tell Typetron how the database looks like. In this case we need to
create an _Article_ entity since we want to add articles in the database. Entity names are at singular usually. Let's
create an _Article.ts_ file inside Entities folder:

```file-path
📁 Entity/Article.ts
```

```ts
import { Column, Entity, ID, Options, PrimaryColumn } from '@Typetron/Database'

@Options({
    table: 'articles'
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

Let's also add timestamp fields to know when the article was created or updated:

```file-path
📁 Entity/Article.ts
```

```ts
import { Column, CreatedAt, Entity, ID, Options, PrimaryColumn, UpdatedAt } from '@Typetron/Database'

@Options({
    table: 'articles'
})
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

The _createdAt_ and _updatedAt_ fields will be automatically populated with their respective values when an Entity is
created or updated because they were annotated with the _@CreatedAt()_ and the _@UpdatedAt()_ decorators.

Now, every time you save your entities, the database will synchronize with your entities. This "synchronize" feature is
activated by the _synchronizeSchema: true_ line in the _config/database.ts_ file. This should only be used in the
development process of an app. We will leave it on for the purposes of our tutorial.

#### Populating the database

Open the _database.sqlite_ file found in the root of the project in your favorite SQL editor. You can try
[DB Browser](https://sqlitebrowser.org/) which is free. Intellij IDEA and PHPStorm have a database module built-in that
you can use. For other Intellij products, like Webstorm, you can install the Database Navigator plugin.

Fill the _articles_ table with some data:

```sql
INSERT INTO articles (title, content, createdAt, updatedAt)
VALUES ('Ultimate Crispy "Chicken" Sandwich', 'Content here', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Chunky Monkey Smoothie Bowls', 'Content here too', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('Chicken chunks with green curry', 'Content here more', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
```

#### Showing articles

Let's add a method inside _HomeController_ that will show all the articles from the database. Remove the _welcome_
method (which is just a dummy method anyways) and add this:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get } from '@Typetron/Router'
import { Article } from 'App/Entities/Article'

@Controller()
export class HomeController {

    @Get()
    index() {
        return Article.get()
    }
}
```

The _@Get()_ decorator will register a route inside Typetron that will respond to HTTP GET requests.

The _Article.get()_ will go inside the database and select everything from the _articles_ table and return the result to
the user. This is similar with running an SQL select like:`SELECT * from articles`. Now, if we go inside the browser we
should see an empty array.


<div class="tutorial-next-page">
    In the next part we will add the basic actions to create, update and delete articles.

    <a href="crud">
        <h3>Next ></h3>
        Managing articles
    </a>

</div>
