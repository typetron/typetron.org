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
    staticAssets: {
        '*': ['public']
    }
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

#### Creating custom configuration files

_In progress_
