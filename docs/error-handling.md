---
layout: docs
title: Error Handling
---

## {{ page.title }}

You can modify the existing `ErrorHandler` inside the `Services` directory. The default handler looks like this:
```ts
import { ErrorHandler as ErrorHandlerBase, Http, HttpError, Response } from '@Typetron/Http';
import { Inject } from '@Typetron/Container';
import { AppConfig } from '@Typetron/Framework';

export class ErrorHandler extends ErrorHandlerBase {

    @Inject()
    appConfig: AppConfig;

    handle(error: Error) {
        if (this.appConfig.environment === 'production') {
            if (error instanceof HttpError) {
                return new Response(error.status, error.content);
            }
            return new Response(Http.Status.BAD_REQUEST, error.message);
        }
        return super.handle(error);
    }
}
```
