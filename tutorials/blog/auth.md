---
layout: blog
title: Authentication
---

## Authentication

Right now everyone can add, edit and delete articles on our blog, but we want to restrict this
so only we can do these actions. To do so, we need to protect our routes so only a trusted user
(you) can access them. This is what [authentication](/docs/authentication) is all about.

Typetron has support for [authentication](/docs/authentication) out of the box. You can protect our routes by using
the _AuthMiddleware_: 

```file-path
📁 Controllers/Http/HomeController.ts
```
```ts
import { Controller, Delete, Get, Middleware, Patch, Post } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Article } from 'App/Entities/Article'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Storage } from '@Typetron/Storage'

@Controller()
export class HomeController {

    // ...

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        // ...
    }

    @Patch(':Article')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm) {
        // ...
    }

    @Delete(':Article')
    @Middleware(AuthMiddleware)
    async delete(article: Article) {
        await article.delete()
    }
}
```
Now, if you will try to create a new article you will get an error similar to this:

```json
{
    "message": "Unauthenticated",
    "stack": [
        "Route: POST /",
        "Error: Unauthenticated",
        "AuthMiddleware.handle (<..>/Middleware/AuthMiddleware.ts)",
        "processTicksAndRejections (internal/process/task_queues.js:93:5)",
        "..."
    ]
}
```

This is because the route is now protected, and it will only allow for authenticated users. 
We can become authenticated by sending an authentication token in our request. We can get 
this token by logging-in using the _/login_ endpoint. If you take a look inside _Controllers/Http_
you can see an _AuthController_ that has two routes responsible for registering and logging-in
users. In order to login we need to have users in our database. Let's create one now.

Make an HTTP POST request to [localhost:8000/register](http://localhost:8000/register) with the following content in
order to register a user:
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

The server will allow us to access the protected routes while we send token set in our requests. You can check it 
out by creating a new article, update or delete.

There is a small problem now. Since we have a register route, everyone can use it to register an account. For this 
specific app, we need only one user to be active at a time. Let's update the _AuthController_ to restrict the register
process to only one user:

```file-path
📁 Controllers/Http/AuthController.ts
```
```ts
import { Controller, Post } from '@Typetron/Router'
import { RegisterForm } from 'App/Forms/RegisterForm'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { LoginForm } from 'App/Forms/LoginForm'
import { Inject } from '@Typetron/Container'
import { Auth } from '@Typetron/Framework/Auth'

@Controller()
export class AuthController {

    @Inject()
    auth: Auth

    @Post('register')
    async register(form: RegisterForm) {
        if ((await User.newQuery().count()) >= 1) {
            throw new Error('You are not allowed to register')
        }

        const user = await User.where('email', form.email).first()
        if (user) {
            throw new Error('User already exists')
        }

        if (form.password !== form.passwordConfirmation) {
            throw new Error('Passwords don\'t match')
        }

        return UserModel.from(await this.auth.register(form.email, form.password))
    }

    @Post('login')
    async login(form: LoginForm) {
        return {
            token: await this.auth.login(form.email, form.password)
        }
    }
}
```

Now, after you register your first user, no one can register anymore. This way you can be the only editor in the app.

<div class="tutorial-next-page">
    In the next part, we will a few changes to the app preparing it to hit the real world.
    
    <a href="final-touches">
        <h3>Next ></h3>
        Final touches
    </a>
</div>
