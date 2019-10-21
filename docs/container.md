---
layout: docs
title: IoC Container
---

## {{ page.title }}

The [IoC Container (Inversion of Control Container)](https://www.martinfowler.com/articles/injection.html) is
the heart of Typetron, many of the core modules using it. It helps with managing and performing dependency
injection.

Let's look at an example:

```ts
import { Controller, Get } from '@Typetron/Router';
import { Request } from '@Typetron/Http';

@Controller('articles')
export class ArticleController {
    @Get()
    search(request: Request) {
        return request.query.search
    }
}
```

The `ArticleController` has the `search` method which returns the value of the query parameter `search`. A
request made to `/articles?search="programming"` returns "programming", but the question is: how is the 
`request: Request` passed to the `search` method? Who is instantiating it? The answer is the Ioc Container.

Behind the scenes, Typetron checks if there are any parameters needed by the method. In this case, the 
`search` method needs an instance of the `Request` class. When the Router calls the `search` method, it will
provider automatically the dependency needed.

In fact, you can use any class as a dependency and Typetron will automatically resolve that dependency for you:
  
```ts
import { Controller, Get } from '@Typetron/Router';
import { Request } from '@Typetron/Http';

class Logger {
    log(uri: string) {
        console.log(`A request was made to ${uri}`);
    }
}

@Controller('articles')
export class ArticleController {
    @Get()
    search(request: Request, logger: Logger) {
        logger.log(request.uri);
        return "searching articles";
    }
}
```

In this example, whenever the `search` method is called, the IoC Container will pass the `Request` instance
and the `Logger` instance as parameters. The you can use those instance to do your business logic.

You can also add dependencies to dependencies and Typetron will resolve them recursively using the `@Inject()`
decorator:

```ts
import { Controller, Get } from '@Typetron/Router';
import { Request } from '@Typetron/Http';
import { Inject } from '@Typetron/Container';

class Logger {

    @Inject()
    request: Request;

    log() {
        console.log(`A request was made to ${this.request.uri}`);
    }
}

@Controller('articles')
export class ArticleController {
    @Get()
    search(logger: Logger) {
        logger.log();
        return "searching articles";
    }
}
```
#### Binding
Binding is the process of registering classes in the container using the `.set` method. There is no need to
manually bind a class in the container since Typetron can resolve them automatically. It is recommended to
bind a class to the container if you want to program to interface, or you want to bind a class to a custom
string key.
 
An example of binding to interface can be found inside `AppProvider`: 
```ts
import { Provider } from '@Typetron/Framework';
import { ErrorHandlerInterface } from '@Typetron/Http';
import { AppErrorHandler } from 'App/Services/AppErrorHandler';

export class AppProvider extends Provider {

    async register() {
        this.app.set(ErrorHandlerInterface, this.app.get(ErrorHandler));
    }

}
```
Here we register a custom `Errorhandler`
and bind it to the `ErrorHandlerInterface`. Typetron's core modules don't know anything about your custom
`ErrorHandler`, but using the `ErrorHandlerInterface` you tell Typetron that he can use that custom handler.
Internally, when Typetron will need an error handler, it will fetch the `ErrorHandlerInterface` and use the
value you've set, in this case is `ErrorHandler`, to handle errors. 

#### Container scopes
_In progress_

##### Singleton scope
```ts
@Injectable(Scope.SINGLETON)
class Cache {}
```

##### Request scope
```ts
@Injectable(Scope.REQUEST)
class Auth {}
```

##### Transient scope
```ts
@Injectable(Scope.TRANSIENT)
class MyService {}
```

