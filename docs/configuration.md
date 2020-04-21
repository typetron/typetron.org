---
layout: docs
title: Configuration
---

## {{ page.title }}

To make your apps fit the desired purpose, Typetron offers a way to configure them through configuration files found in
the _config_ directory.

```ts
export default new AppConfig({
    port: 8000,
    environment: 'development',
    middleware: [],
    providers: [],
    staticAssets: {
        '': ['public']
    }
});
```

#### Getting config
If you need to get some config in one of your classes, controllers or services, you can make use of dependency injection
to get it:

```ts
import { Controller, Get } from '@Typetron/Router';
import { Inject } from '@Typetron/Container';
import { AppConfig, DatabseConfig } from '@Typetron/Framework';

@Controller()
export class HomeController {
    @Inject()
    appConfig: AppConfig;

    @Inject()
    databaseConfig: DatabseConfig;

    @Get()
    async index() {
        return `App runs on port ${this.appConfig.port}`;
    }
}
```

#### Creating custom configuration files
_In progress_
