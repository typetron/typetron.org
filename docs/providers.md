---
layout: docs

title: Providers
---

## {{ page.title }}

Providers are simple classes used to register something in the framework at boot time. A provider must extend
the _Provider_ abstract class from _@Typetron/Framework_ and implement the _register_ method. In the example below is an
implementation of a _RoutingProvider_ used to register the routes of your app:

```ts
import { AppConfig, Provider } from '@Typetron/Framework'
import { Router } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'

export class RoutingProvider extends Provider {
    directory = 'Controllers'

    @Inject()
    appConfig: AppConfig

    @Inject()
    router: Router

    register() {
        this.router.middleware = this.appConfig.middleware || []

        this.router.loadControllers(this.app.directory + '/' + this.directory)
    }
}
```

The _RoutingProvider_ is responsible for registering your controllers from a specific directory. If, for example, you
want to use a second directory to load controllers from, you can change this provider to do just that:

```ts
import { AppConfig, Provider } from '@Typetron/Framework'
import { Router } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'

export class RoutingProvider extends Provider {
    directory = 'Controllers'
    customDirectory = 'CustomDirectory'

    @Inject()
    appConfig: AppConfig

    @Inject()
    router: Router

    register() {
        this.router.middleware = this.appConfig.middleware || []

        this.router.loadControllers(this.app.directory + '/' + this.directory)
        this.router.loadControllers(this.app.directory + '/' + this.customDirectory)
    }
}
```
