---
layout: docs
title: "Controllers"
---

## {{ page.title }}

Controllers allow you to define routes for your app. A method inside a controller can be a route if it is 
annotated with one of the available routing decorators `@Get()`, `@Post()`, `@Patch()`, `@Put()`, `@Delete()` etc.
Below is an example of a controller: 
```ts
import { Controller, Get } from '@Typetron/Router';

@Controller('articles')
class ArticleController {

    @Get()
    index() {
        return 'This route will show a list of all articles';
    }

    @Get('top')
    top() {
        return 'This route will show a list of top articles';
    }
}
```
This will create two routes that can be accessed at `http://localhost:8000/articles` and `http://localhost:8000/articles/top`;

<a name="route-parameters"></a>
### Route parameters

It is often the case when sometimes you will need the get some parts of the request path. 
For example, you may want to show a particular article based on an ID with the following route: `/articles/1`.
In order to get the value `1` in your controller's method you can use route parameters like in the example below:  
```ts
import { Controller, Get } from '@Typetron/Router';

@Controller('articles')
class ArticleController {

    @Get(':id')
    read(id: number) {
        return `This route will show the article with id ${id}`;
    }
}
```
> **_Note_** Route parameters, by default, are of type `string`. 
> Typetron will automatically convert parameters from `string` to `number` if you expect them like so. 

### Named routes
You can set a name for a route by providing a second parameter in the annotations that resemble the HTTP methods `@Get()`, `@Post()` etc.:

```ts
import { Controller, Get } from '@Typetron/Router';

@Controller()
class HomeController {

    @Get('', 'home')
    home() {
        return `Home page`;
    }

}
``` 
This is helpful when you want to redirect a user to a route, or generate one and you don't want to use it's full path.

By default, Typetron will set the routes names using the `@Controller` path and the name of the controller method, 
separating the two with a dot. For example, take the bellow controller:
```ts
import { Controller, Get } from '@Typetron/Router';

@Controller('articles')
class ArticleController {

    @Get()
    read() {}
}
``` 
This will create a route having the name `articles.read`.

If you want to overwrite the prefix you can do it by setting the prefix property inside `@Controller`:
```ts
import { Controller } from '@Typetron/Router';

@Controller('articles', { 
    prefix: "posts" 
})
class ArticleController {

    @Get()
    read() {}
}
``` 
This will set the route's name to `posts.read`.

### Middleware
Middleware provide a way of intercepting the client's request and operate on it based on your needs.
For example, Typetron provides an [Authentication](/docs/authentication) middleware responsible for 
verifying if the user is authenticated on your site or not. You can use Typetron's built it middleware
or create your own middleware and place them inside your app's `AppConfig`.

```ts;
import { MyMiddleware } from 'App/Middleware/MyMiddleware';

export default new AppConfig({
    middleware: [
        MyMiddleware
    ],
});
```  

#### Controller middleware
Adding middleware inside `AppConfig` will run them on every request. If you want to add a middleware only
to a single controller you can use the controller's middleware option to do that:
```ts
import { Controller, Middleware } from '@Typetron/Router';
import { MyMiddleware } from 'App/Middleware/MyMiddleware';

@Controller('articles')
@Middleware(MyMiddleware)
class ArticleController {}
``` 
In this case, the middleware will run only if the client makes a request that begin with `/articles`.

#### Method middleware
If you want to be more specific with your middleware, you can add it to the method using the @Middleware()
decorator: 


```ts
import { Controller, Middleware } from '@Typetron/Router';
import { MyMiddleware } from 'App/Middleware/MyMiddleware';

@Controller('articles')
class ArticleController {

    @Get('top')
    @Middleware(MyMiddleware)
    top() {}

}
``` 

### Request
In order to get the request instance you should type-hint the `Request` class from `@Typetron/Http` module:

```ts
import { Controller } from '@Typetron/Router';
import { Request } from '@Typetron/Http';

@Controller('articles')
class ArticleController {

    @Get()
    all(request: Request) {
        return request.uri;
    }
}
```
You can also get the query parameters from the `request` instance using the `request.query` property:
```ts
import { Controller } from '@Typetron/Router';
import { Request } from '@Typetron/Http';

@Controller('articles')
class ArticleController {
    
    @Get()
    all(request: Request) {
        return request.query;
    }
}
```
A request like `/articles?topic=programming` will create an object like the following:
```ts
{
    'programming'
}
```

If you want to get a specific query parameter you can use the `request.query.parameterName`. Typetron also 
provides a handy decorator for such a job:
```ts
import { Controller } from '@Typetron/Router';

@Controller('articles')
class ArticleController {
    
    @Get()
    all(@Query('topic') topic: string) {
        return `Showing articles from ${topic}`;
    }
}
```
<a name="route-entity-binfing"></a>
### Route Entity binding

Many times you will face the situation where you will have to find an [entity](orm) based on it's id like in the example
below:
```ts
import { Controller, Get } from '@Typetron/Router';
import { Article } from 'App/Entities/Article';

@Controller('articles')
class ArticleController {

    @Get(':id')
    async read(id: number) {
        const article = await Article.find(id);
        // ...
        return article;
    }
}
```

Typetron's Route Entity binding will make finding entities easier by automatically injecting the entity in the method's
parameters. All you have to do is to annotate it and make sure the route parameter's name matches the entity's name: 

```ts
import { Controller, Get } from '@Typetron/Router';
import { Article } from 'App/Entities/Article';

@Controller('articles')
class ArticleController {

    @Get(':Article')
    read(article: Article) {
        // ...
        return article;
    }
}
```
