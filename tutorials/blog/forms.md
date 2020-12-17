---
layout: blog
title: Forms
---

## {{ page.title }}

In the previous part we created a route that responded to a HTTP Post request at [localhost:8000](http://localhost:8000). 
Let's make use of [Forms](http://localhost:4000/docs/forms) and validate user input, so we can save it when we will be 
adding a database to our app.

Forms are simple classes with fields that show what input is accepted by the app. Create an _ArticleForm.ts_ file
inside a _Forms_ directory in the app's root folder with this content:

```file-path
📁 Forms/ArticleForm.ts
```
```ts
import { Field, Form } from '@Typetron/Forms'

export class ArticleForm extends Form {

    @Field()
    title: string

    @Field()
    content: string
}
``` 
Here we have a simple class that extends the base _Form_ class from Typetron. The base _Form_ class contains special
methods that are used to validate the user input. When creating a form you should always extend the _Form_ class. Inside
the class we have two properties annotated with the _@Field()_ decorator telling Typetron what are the form inputs.

We can now use this form in our _add_ from _HomeController_ to capture the user's input.
Let's just return the data back to the user to see everything works:

```file-path
📁 Controllers/Http/HomeController.ts
```
```ts
import { ArticleForm } from 'App/Forms/ArticleForm'

@Controller()
export class HomeController {

    // ...

    @Post()
    add(form: ArticleForm) {
        return form
    }
}
``` 

You can test this route by making a POST request and send a raw JSON with the form fields like so and you will get that
back from the server:
```json
{
    "title": "title",
    "content": "some content"
}
```

Nothing special here. We can also validate the fields in the form by adding rules to them using
the _@Rules()_ decorator. Let's make the title and content required fields with the title 
needing at least 5 characters:

```file-path
📁 Forms/ArticleForm.ts
```
```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { MinLength, Required } from '@Typetron/Validation'

export class ArticleForm extends Form {

    @Field()
    @Rules(
        Required,
        MinLength(5)
    )
    title: string

    @Field()
    @Rules(
        Required
    )
    content: string
}
```
You can also [create your own validation rules](/docs/forms#custom-validation). 
Now, whenever the client inputs invalid data, he will get an error. Try adding a title with less than 5 
characters inside the _body_ of the request as a _raw_ JSON like in the image below input 
and you should see an error like this one:

<p align="center" class="window">
  <img src="/images/tutorials/blog/invalid-form.jpg" />
</p> 


<div class="tutorial-next-page">
    How that we know how to validate our data we can save it in a database. In the next part we will setup a SQLite 
    database to store our validated data.
    
    <a href="database">
        <h3>Next ></h3>
        Database
    </a>
</div>
