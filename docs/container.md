---
layout: docs

title: IoC Container
---

## {{ page.title }}

The [IoC Container (Inversion of Control Container)](https://www.martinfowler.com/articles/injection.html) is the heart
of Typetron, and many of the core modules are using it. It helps with managing and performing dependency injection.

Let's look at an example:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Request } from '@Typetron/Web'

@Controller('articles')
export class ArticleController {
    @Get()
    search(request: Request) {
        return request.query.search
    }
}
```

The _ArticleController_ has the _search_ method which returns the value of the query parameter _search_. A request made
to _/articles?search="programming"_ returns "programming", but the question is: how is the
_request: Request_ passed to the _search_ method? Who is instantiating it? The answer is: the Ioc Container.

Behind the scenes, Typetron checks if there are any parameters needed by the method. In this case, the
_search_ method needs an instance of the _Request_ class. When the Router calls the _search_ method, it will
automatically provide the dependency needed.

In fact, you can use any class as a dependency and Typetron will automatically resolve that dependency for you:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Request } from '@Typetron/Web'

class Logger {
    log(uri: string) {
        console.log(`A request was made to ${uri}`)
    }
}

@Controller('articles')
export class ArticleController {
    @Get()
    search(request: Request, logger: Logger) {
        logger.log(request.uri)
        return "searching articles"
    }
}
```

In this example, whenever the _search_ method is called, the IoC Container will pass the _Request_
and _Logger_ instances as parameters. Then you can use those instances to create your business logic.

You can also add dependencies to dependencies and Typetron will resolve them recursively using the _@Inject()_
decorator:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Request } from '@Typetron/Web'
import { Inject } from '@Typetron/Container'

class Logger {

    @Inject()
    request: Request

    log() {
        console.log(`A request was made to ${this.request.uri}`)
    }
}

@Controller('articles')
export class ArticleController {
    @Get()
    search(logger: Logger) {
        logger.log()
        return "searching articles"
    }
}
```

#### Binding

Binding is the process of registering classes in the container using the _.set_ method. There is no need to manually
bind a class in the container since Typetron can resolve them automatically. It is recommended to bind a class to the
container if you want to program to interface, or you want to bind a class to a custom string key.

An example of binding to interface can be found inside _AppProvider_:

```ts
import { Provider } from '@Typetron/Framework'
import { ErrorHandlerInterface } from '@Typetron/Web'
import { AppErrorHandler } from 'App/Services/AppErrorHandler'

export class AppProvider extends Provider {

    async register() {
        this.app.set(ErrorHandlerInterface, this.app.get(ErrorHandler))
    }

}
```

Here we register a custom _Errorhandler_ and bind it to the _ErrorHandlerInterface_. Typetron's core modules don't know
anything about your custom _ErrorHandler_, but using the _ErrorHandlerInterface_ you tell Typetron that he can use that
custom handler. Internally, when Typetron will need an error handler, it will fetch the _ErrorHandlerInterface_ and use
the value you've set. In this case, it will use the custom _ErrorHandler_ class instance to handle errors.

#### Container scopes

By default, the container creates singleton instances for the dependencies you use, but there are use cases when you 
want to create an instance every time you need one, or at every user request. This option is called the scope of the
service. You can set the scope of a service by using the _@Injectable()_ decorator and then set the necessary scope, just
like in the examples below;

##### Singleton scope
Creating an instance that will be globally used in the app as a singleton:
```ts
@Injectable(Scope.SINGLETON)
class Cache {}
```

##### Request scope
Creating an instance with every user request:
```ts
@Injectable(Scope.REQUEST)
class Auth {}
```

##### Transient scope
Creating an instance every time you request the dependency:
```ts
@Injectable(Scope.TRANSIENT)
class MyService {}
```

