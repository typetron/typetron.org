---
layout: docs

title: "Controllers"
---

## {{ page.title }}

Controllers allow you to define routes for your app. A method inside a controller can be a route if it is annotated with
one of the available routing decorators _@Get()_, _@Post()_, _@Patch()_, _@Put()_, _@Delete()_ etc. Below is an example
of a controller:

```ts
import { Controller, Get } from '@Typetron/Router'

@Controller('articles')
class ArticleController {

    @Get()
    index() {
        return 'This route will show a list of all articles'
    }

    @Get('top')
    top() {
        return 'This route will show a list of top articles'
    }
}
```

This will create two routes that can be accessed at _http://localhost:8000/articles_ and
_http://localhost:8000/articles/top_

<a name="route-parameters"></a>

### Route parameters

It is often the case when sometimes you will need the get some parts of the request path. For example, you may want to
show a particular article based on an ID from the following route: _/articles/1_. In order to get the value _1_ in your
controller's method you can use route parameters like in the example below:

```ts
import { Controller, Get } from '@Typetron/Router'

@Controller('articles')
class ArticleController {

    @Get(':id')
    read(id: number) {
        return `This route will show the article with id ${id}`
    }
}
```

> **_Note_** Route parameters, by default, are of type _string_.
> Typetron will automatically convert parameters from _string_ to _number_ if you write the type to _number_.

### Named routes

You can set a name for a route by providing a second parameter in the annotations that resemble the HTTP
methods _@Get()_, _@Post()_ etc.:

```ts
import { Controller, Get } from '@Typetron/Router'

@Controller()
class HomeController {

    @Get('', 'home')
    home() {
        return `Home page`
    }
}
``` 

This is helpful when you want to redirect a user to a route when you don't want to use its full path.

By default, Typetron will set the routes names using the _@Controller_ path and the name of the controller method,
separating the two with a dot. For example, take the bellow controller:

```ts
import { Controller, Get } from '@Typetron/Router'

@Controller('articles')
class ArticleController {

    @Get()
    read() {}
}
``` 

This will create a route with the endpoint _/articles_ having the name _articles.read_.

If you want to overwrite the prefix you can do it by setting the prefix property inside _@Controller_:

```ts
import { Controller } from '@Typetron/Router'

@Controller('articles', {
    prefix: "posts"
})
class ArticleController {

    @Get()
    read() {}
}
``` 

This will set the route's name to _posts.read_.

### Middleware

Middleware provide a way of intercepting the client's request and operate on it based on your needs. For example,
Typetron provides an [Authentication](/docs/authentication) middleware responsible for verifying if the user is
authenticated in your app or not. You can also create you own middleware by implementing _MiddlewareInterface_. 
He is an example of a custom authentication middleware:

```ts
import { Injectable } from '../../Container'
import { MiddlewareInterface, RequestHandler } from '../../Router'
import { Request } from '@Typetron/Web'

@Injectable()
export class MyAdmin implements MiddlewareInterface {

    async handle(request: Request, next: RequestHandler) {

        // processing here

        return next(request)
    }
}
``` 

You can then use this middleware inside _config/app.ts_ configuration file:
```ts 
export default new AppConfig({
    middleware: [
        MyMiddleware
    ],
});
```

#### Controller middleware

Adding middleware inside _AppConfig_ will run them on every request. If you want to add a middleware only to a single
controller you can use the controller's middleware option to do that:

```ts
import { Controller, Middleware } from '@Typetron/Router'
import { MyMiddleware } from 'App/Middleware/MyMiddleware'

@Controller('articles')
@Middleware(MyMiddleware)
class ArticleController {}
``` 

In this case, the middleware will run only if the client makes a request that begins with _/articles_.

#### Method middleware

If you want to be more specific with your middleware, you can add it to the method using the @Middleware()
decorator:

```ts
import { Controller, Middleware } from '@Typetron/Router'
import { MyMiddleware } from 'App/Middleware/MyMiddleware'

@Controller('articles')
class ArticleController {

    @Get('top')
    @Middleware(MyMiddleware)
    top() {}

}
``` 

### Request

In order to get the request instance you should type-hint the _Request_ class from _@Typetron/Web_ module:

```ts
import { Controller } from '@Typetron/Router'
import { Request } from '@Typetron/Web'

@Controller('articles')
class ArticleController {

    @Get()
    all(request: Request) {
        return request.uri
    }
}
```

You can also get the query parameters from the _request_ instance using the _request.query_ property:

```ts
import { Controller } from '@Typetron/Router'
import { Request } from '@Typetron/Web'

@Controller('articles')
class ArticleController {

    @Get()
    all(request: Request) {
        return request.query
    }
}
```

A request like _/articles?topic=programming_ will create an object like the following:

```ts
{
    'programming'
}
```

If you want to get a specific query parameter, you can use the _request.query.parameterName_. Typetron also provides a
handy decorator for such a job:

```ts
import { Controller } from '@Typetron/Router'

@Controller('articles')
class ArticleController {

    @Get()
    all(@Query('topic') topic: string) {
        return `Showing articles from ${topic}`
    }
}
```

<a name="route-entity-binfing"></a>

### Route Entity binding

Many times you will face the situation where you have to find an [entity](orm) based on its id, like in the example
below:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Article } from 'App/Entities/Article'

@Controller('articles')
class ArticleController {

    @Get(':id')
    async read(id: number) {
        const article = await Article.find(id)
        // processing here
        return article
    }
}
```

Typetron's Route Entity binding makes finding entities easier by automatically injecting the entity in the method's
parameters. All you have to do is type-hint it and make sure the route parameter's name matches the entity's name:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Article } from 'App/Entities/Article'

@Controller('articles')
class ArticleController {

    @Get(':Article')
    read(article: Article) {
        // processing here
        return article
    }
}
```
