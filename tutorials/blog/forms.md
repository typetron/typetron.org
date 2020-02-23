---
layout: tutorial
title: Forms
---

## {{ page.title }}

In the previous part we created a route that responded to a Post request at [localhost:8000](http://localhost:8000). 
Let's make use of forms and accept user input so we can save it when we will be adding a database to our app.

Forms are simple classes with fields that show what input is accepted by the app. Create an **ArticleForm.ts** file
inside a **Forms** directory in the app's root folder with this content:

```ts
import { Field, Form } from '@Typetron/Forms';

export class ArticleForm extends Form {

    @Field()
    title: string;

    @Field()
    content: string;
}
``` 

We can now use this form in our **add** from **HomeController**. Let's just return the data back to the user:

```ts
// ...
import { ArticleForm } from 'App/Forms/ArticleForm';

@Controller()
export class HomeController {

    // ...

    @Post()
    add(form: ArticleForm) {
        return form;
    }
``` 

Nothing special here. We can also validate the fields in the form by adding rules to the using the **@Rules** decorator.
Let's make the title and content required fields with the title needing at least 5 characters:

```ts
import { Field, Form, Rules } from '@Typetron/Forms';
import { Min, Required } from '@Typetron/Validation';

export class ArticleForm extends Form {

    @Field()
    @Rules(
        Required,
        Min(5)
    )
    title: string;

    @Field()
    @Rules(
        Required
    )
    content: string;
}
```

Now, whenever the client inputs invalid data, he will get an error. Try adding a title with less than 5 
characters and you should see an error like this one:


<p align="center">
  <img src="/images/tutorials/blog/invalid-form.jpg" />
</p> 


In the next part we will setup a SQLite database to store our data >>>>>> [Database](database).

