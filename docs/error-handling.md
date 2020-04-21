---
layout: docs
title: Error Handling
---

## {{ page.title }}

Every error in the app passes through the _AppErrorHandler_ class found inside the _Services_ directory. 
You can modify the existing `AppErrorHandler` inside the `Services` directory. The default handler looks like this:

```ts
import { ErrorHandler, Request } from '@Typetron/Http';

export class AppErrorHandler extends ErrorHandler {

    handle(error: Error, request?: Request) {
        return super.handle(error, request);
    }
}

```

If you would like to handle errors differently for a production environment, you can do that like so: 

```ts
import { ErrorHandler } from '@Typetron/Http';
import { Inject } from '@Typetron/Container';
import { AppConfig } from '@Typetron/Framework';

export class AppErrorHandler extends ErrorHandler {
    @Inject()
    appConfig: AppConfig;

    handle(error: Error) {
        if (this.appConfig.environment === 'production') {
            // something different
        }
        return super.handle(error);
    }
}
```
