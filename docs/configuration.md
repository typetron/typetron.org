---
layout: docs

title: Configuration
---

## {{ page.title }}

To make your apps fit your desired purpose, Typetron offers a way to configure it through configuration files found in
the _config_ directory.

Here is an example of a configuration file:

```file-path
📁 config/app.ts
```

```ts
import { AppConfig, DatabaseProvider } from '@Typetron/Framework'
import { RoutingProvider } from 'App/Providers/RoutingProvider'
import { AppProvider } from 'App/Providers/AppProvider'

export default new AppConfig({
    port: 8000,
    environment: 'development',
    middleware: [],
    providers: [
        AppProvider,
        RoutingProvider,
        DatabaseProvider
    ],
    staticAssets: [
        {
            url: '.*',
            path: 'public'
        }
    ]
})
```

#### Getting config

If you need to get a specific configuration in one of your classes, controllers or services, you can make use of
[dependency injection](/docs/container.md) like in the example below:

```ts
import { Controller, Get } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'
import { AppConfig, DatabaseConfig } from '@Typetron/Framework'

@Controller()
export class HomeController {

    @Inject()
    appConfig: AppConfig

    @Inject()
    databaseConfig: DatabaseConfig

    @Get()
    async index() {
        return `App runs on port ${this.appConfig.port}`
    }
}
```

#### Environment Configuration
It is recommended to have different configuration for each environment the app is running on. This is usually because
you may want to attach different resources to it like database or caching drivers.

To make this easy, Typetron uses the [DotEnv](https://github.com/motdotla/dotenv) package. You can find an example
file in your app's root directory called `.env.example`. After creating a new Typetron app, the Typetron CLI will copy
this file into the `.env` file that is then consumed by the app.

#### Creating custom configuration files

_In progress_
