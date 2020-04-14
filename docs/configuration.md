---
layout: docs
title: Configuration
---

## {{ page.title }}

_In progress_

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
If you need the use get some config in one of your classes or services, you can make use of dependency injection
to get it:

```ts
import { Controller } from '@Typetron/Router';
import { Inject } from '@Typetron/Container';
import { AppConfig } from '@Typetron/Framework';

@Controller()
export class HomeController {
    @Inject()
    appConfig: AppConfig;
}
```

#### Creating custom configuration files
_In progress_
