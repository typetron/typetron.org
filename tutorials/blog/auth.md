---
layout: tutorial
title: Authentication
---

## Authentication

Right now everyone can add, edit and delete articles on our blog, but we want to restrict this
so only we can do these actions. To do so we need to protect our routes so only a trusted user
(you) can access them. This is what authentication is all about.

Typetron has support for authentication out of the box. You can protect our routes by using
the _AuthMiddleware_: 
```ts
import { Controller, Delete, Get, Middleware, Patch, Post } from '@Typetron/Router';
import { ArticleForm } from 'App/Forms/ArticleForm';
import { Article } from 'App/Entities/Article';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';
import { Storage } from '@Typetron/Storage';

@Controller('api')
export class HomeController {

    // ...

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        // ...
    }

    @Patch('{article}')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm) {
        // ...
    }

    @Delete('{article}')
    @Middleware(AuthMiddleware)
    async delete(article: Article) {
        await article.delete();
    }
}
```
Now, if you will try to create a new article you will get an error like this:

```json
{
    "message": "Unauthenticated",
    "stack": [
        "Error: Unauthenticated",
        "AuthMiddleware.handle (<..>/Middleware/AuthMiddleware.ts)",
        "processTicksAndRejections (internal/process/task_queues.js:93:5)"
    ]
}
```

This is because the route is now protected and it will only allow for authenticated users. 
We can become authenticated by sending an _authentication_ token in our request. We can get 
this token by logging-in using the _/login_ endpoint. If you take a look inside _Controllers/Http_
you can see an _AuthController_ that has two routes responsible for registering and logging-in
users. In order to login we need to have users in out database and a place to save them. 
Let's create a table in our database:



```sql
create table users
(
	id integer constraint users_pk rimary key autoincrement,
	email varchar not null,
	name varchar,
	password varchar not null
);

create unique index users_email_uindex on users (email);
```

Now we can just make a HTTP POST request to [localhost:8000/register](http://localhost:8000/register)
with the following content in order to register an user:
```json
{
	"email": "admin@admin.test",
	"password": "password",
	"passwordConfirmation": "password"
}
```
 
<p align="center" class="window">
  <img src="/images/tutorials/blog/register.jpg" />
</p>

Now we can use the _/login_ endpoint to get a [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token)
authentication token:

<p align="center" class="window">
  <img src="/images/tutorials/blog/login.jpg" />
</p>

This token can now be used in our requests by sending it in the headers. This can easily be
done using postman:

<p align="center" class="window">
  <img src="/images/tutorials/blog/article-with-auth.jpg" />
</p>


In the next part we will implement a simple frontend that will show our personal blog >>>>>> [Frontend](frontend).