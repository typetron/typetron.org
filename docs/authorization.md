---
layout: docs

title: Authorization
---

## {{ page.title }}


#### Protecting routes

You can protect your routes by using the _AuthMiddleware_ in your controllers like this:

```ts
import { Controller, Middleware } from '@Typetron/Router'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    index() {
        return "this route is for logged in users only"
    }

    @Get()
    read() {
        return "this route is for logged in users only"
    }
}
```

Or you can add it to specific methods like this:

```ts
import { Controller, Middleware } from '@Typetron/Router'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
export class HomeController {

    @Get()
    @Middleware(AuthMiddleware)
    index() {
        return "this route is for logged in users only"
    }
}
```

#### Getting the currently logged user

To get the authenticated user you can use the _@AuthUser_ decorators in a property or method argument:

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { User } from 'App/Entities/User'
import { AuthUser } from '@Typetron/Framework/Auth'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @AuthUser()
    authenticatedUser: User

    @Post()
    me() {
        return this.user
    }
}
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { User } from 'App/Entities/User'
import { AuthUser } from '@Typetron/Framework/Auth'

@Controller()
export class HomeController {

    @Post()
    @Middleware(AuthMiddleware)
    me(@AuthUser() authenticatedUser: User) {
        return authenticatedUser
    }
}
```


