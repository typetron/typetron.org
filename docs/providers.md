---
layout: docs
title: Providers
---

## {{ page.title }}

Providers are simple classes used to register something in the framework at boot time. A provider must extend
the `Provider` abstract class from `@Typetron/Framework` and implement the `register` method. Let's take a
look at on of the most important provider of an app: `RoutingProvider` found inside `Providers` directory:
 
```ts
import { AppConfig, Provider } from '@Typetron/Framework';
import { Router } from '@Typetron/Router';
import { Inject } from '@Typetron/Container';

export class RoutingProvider extends Provider {
    directory = 'Controllers';

    @Inject()
    appConfig: AppConfig;

    @Inject()
    router: Router;

    register() {
        this.router.middleware = this.appConfig.middleware || [];

        this.router.loadControllers(this.app.directory + '/' + this.directory);
    }
}
```

The `RoutingProvider` is responsible for registering your controllers from a specific directory. If, for example,
you want to use a second directory to load controllers from, you can change this provider to do just that:

```ts
import { AppConfig, Provider } from '@Typetron/Framework';
import { Router } from '@Typetron/Router';
import { Inject } from '@Typetron/Container';

export class RoutingProvider extends Provider {
    directory = 'Controllers';
    customDirectory = 'CustomDirectory';

    @Inject()
    appConfig: AppConfig;

    @Inject()
    router: Router;

    register() {
        this.router.middleware = this.appConfig.middleware || [];

        this.router.loadControllers(this.app.directory + '/' + this.directory);
        this.router.loadControllers(this.app.directory + '/' + this.customDirectory);
    }
}
```
