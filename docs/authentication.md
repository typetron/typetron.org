---
layout: docs
title: Authentication
---

## {{ page.title }}

Authentication is built-in Typetron and configured for you out of the box. All the magic happens inside 
`AuthController` that comes with the Typetron app. Inside, there are two methods that take care of registering
and logging in users.

You can check the `auth.ts` file inside the `config` directory to see the different configuration options.


#### Creating a new user
If you want to create a new use, simply make a POST request to `/register` giving it an email, password and a
password confirmation input as in the following image and you will have a user created in your database. 
> **_Note_** Make sure you have a users table that has all the columns from the User entity.
 
```json
{
	"email": "john@example.com",
	"password": "myPassword",
	"passwordConfirmation": "myPassword"
}
```
 
#### Logging in a user
You can now login with your newly created user by making a POST request to the `/login` route providing the
email and the password:
```json
{
	"email": "john@example.com",
	"password": "myPassword"
}
```

You will be getting a [JWT](https://jwt.io/) token back that you can use to authenticate the user in your app.
 
#### Authenticating users
You can authenticate a user by using the `AuthMiddleware` on your controllers like this:

```ts
import { Controller, Middleware} from '@Typetron/Router';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    index() {
        return "this route is for logged in users only";
    }

    @Get()
    read() {
        return "this route is for logged in users only";
    }
}
```

Or you can add it to specific methods like this:
 
```ts
import { Controller, Middleware} from '@Typetron/Router';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';

@Controller()
export class HomeController {

    @Get()
    @Middleware(AuthMiddleware)
    index() {
        return "this route is for logged in users only";
    }
}
```

#### Getting the currently logged user 
Getting the logged in user is very easy. If one of your methods is behind the `AuthMiddleware`, you can use the
`Auth` service by injecting it in your controller or service and get your currently logged user:
```ts
import { Controller, Middleware, Post } from '@Typetron/Router';
import { Inject } from '@Typetron/Container';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';
import { User } from 'App/Entities/User';
import { Auth } from '@Typetron/Framework/Auth';

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Inject()
    auth: Auth;

    @Post()
    async me() {
        return await this.auth.user<User>();
    }
}
```

