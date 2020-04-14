---
layout: docs
title: Forms
---

## {{ page.title }}

Forms are a great way to organise and validate the input from the user. Forms are simple classes inside
the `Forms` directory that extend the `Form` class and uses the `@Field` decorator:
 
```ts
import { Field, Form} from '@Typetron/Forms';

export class LoginForm extends Form {

    @Field()
    email: string;

    @Field()
    password: string;
}
```
You can use the newly created form in your controller methods that have data to process from the user. like a
login form:
```ts
import { Controller, Get, Post } from '@Typetron/Router';
import { LoginForm } from 'App/Forms/LoginForm';

@Controller()
export class AuthController {

    @Post('login')
    login(loginForm: LoginForm) {
        return ['A nice object with the data for the login form', loginForm];
    }
}
```

Of course, for security reasons, you might want to validate the input of your forms. You can do this by using
the `@Rules` decorator where you can add a list of rules that will check the form's fields:

```ts
import { Field, Form, Rules } from '@Typetron/Forms';
import { Required, MinLength } from '@Typetron/Validation/Rules';

export class LoginForm extends Form {

    @Field()
    @Rules(
        Required,
    )
    email: string;

    @Field()
    @Rules(
        Required,
        MinLength(6),
    )
    password: string;
}
```

In the form above we've set the email and the password field to be required in the form with the password
having at least 6 characters in length.
If the form is not valid, Typetron will throw a HTTP error with the code `422 UNPROCESSABLE_ENTITY`.
