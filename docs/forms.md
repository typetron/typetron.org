---
layout: docs

title: Forms
---

## {{ page.title }}

Forms are a great way to organise and validate the input from the user. Forms are simple classes inside the _Forms_
directory that extend the _Form_ class and uses the _@Field_ decorator:

```ts
import { Field, Form } from '@Typetron/Forms'

export class LoginForm extends Form {

    @Field()
    email: string

    @Field()
    password: string
}
```

You can use forms in your controller methods by just type-hinting them, like in the example below:

```ts
import { Controller, Get, Post } from '@Typetron/Router'
import { LoginForm } from 'App/Forms/LoginForm'

@Controller()
export class AuthController {

    @Post('login')
    login(loginForm: LoginForm) {
        return ['A nice object with the data for the login form', loginForm]
    }
}
```

Of course, for security reasons, you might want to validate the input of your forms. You can do this by using
the _@Rules_ decorator where you can add a list of rules that will check the form's fields:

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Required, MinLength } from '@Typetron/Validation/Rules'

export class LoginForm extends Form {

    @Field()
    @Rules(
        Required,
    )
    email: string

    @Field()
    @Rules(
        Required,
        MinLength(6),
    )
    password: string
}
```

In the form above we've set the email and password fields to be required, with the password having at least 6 characters
in length. If the form is not valid, Typetron will throw an HTTP error with the code _422 UNPROCESSABLE_ENTITY_.

<a name="custom-validation"></a>

#### Custom validation

To create a custom validation rule, all you have to do is to extend the base _Rule_ class from the _Validation_
module, like in the example below:

```ts
import { Rule, RuleValue } from '@Typetron/Validation'

export class IsNumber extends Rule {
    identifier = 'isNumber'

    passes(attribute: string, value: RuleValue): boolean {
        return !isNaN(Number(value))
    }

    message(attribute: string): string {
        return `The ${attribute} is not a number`
    }
}
```

To create a validation rule that accepts parameters, you will have to wrap the class in a function like so:

```ts
import { Rule, RuleInterface, RuleValue } from '@Typetron/Validation'
import { Type } from '@Typetron/Support'

export function InArray(values: string[]): Type<RuleInterface> {
    return class extends Rule {
        identifier = 'inArray'

        passes(attribute: string, value: RuleValue): boolean {
            return values.includes(value as string)
        }

        message(attribute: string): string {
            return `The ${attribute} must have a value from the following list ${values.join(', ')}`
        }
    }
}
```
