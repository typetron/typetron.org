---
layout: tutorials
title: Crud
---

## Creating, updating and deleting

After we created `Article` entity, we can create the methods/actions that will take care of handling the user's
requests. In this case, a user wants to see all the articles in the blog. Let's add a method inside
`HomeController` that will do just that. Remove the `welcome` method (which is just a dummy method) and add this: 

```ts
import { Controller, Get } from '@Typetron/Router';
import { Article } from 'App/Entities/Article';

@Controller()
export class HomeController {

    @Get()
    index() {
        return Article.get();
    }
}
```

The `@Get` decorator will register a route inside Typetron that will respond to HTTP GET requests.

The `Article.get()` will go inside the database and select everything from the `articles` and return the result
to the user. This is similar with making a SQL select like this:`SELECT * from articles`. Now, if we go inside
the browser we should see the articles in a JSON format.

#### Showing one article

Let's imagine a user will click on the first article since we don't have a frontend yet. In this case, our app
should display the contents of that article. Let's add a method inside `HomeController` again, that will 
display one particular article:
   
```ts
// ...

@Controller()
export class HomeController {

    // ...

    @Get('{id}')
    async read(id: number) {
        return Article.find(id);
    }
}
```

By giving the `@Get` decorator the parameter `{id}`, Typetron will register a method that will handle all the
requests to `/something` where that `something` is our article identifier.

Now, if you go to [http://localhost:8000/1](http://localhost:8000/1) you will see all the contents of a the 
article with `id` 1. If you change that 1 into 2, you will see the contents of article 2 and so on.

#### Creating an article

Our app can display all the articles or one particular article. Let's make it more interesting and add the 
ability to create an article. To do that, add a method inside `HomeController` with this piece of code:

```ts
// ...

@Controller()
export class HomeController {

    // ...

    @Post()
    async add() {
        const article = new Article();
        article.title = "My awesome article";
        article.content = "My awesome content";
        await article.save();
        return article;
    }
}
```

The `@Post` decorator will register a route that will handle all the HTTP POST requests to `localhost:8000`.
Since we don't have a frontend with a form that we can fill we can't make such requests. To make things easier,
we will use a very popular tool that will allow us to make all kind of complex request such as this one called
[Postman](https://www.getpostman.com/). Install and open it, since will will mostly work in this tool from now
on until we will get a frontend app (or until we will write tests for our app);

There we can change the HTTP Method to POST and write the url we want to post into, which is `localhost:8000`.
If we run this request and check our database we will see the we will have a new article with the title 
`My awesome article`. Actually, every time we run that request we will create such article. 

Let's make it even more interesting and add the user the ability to add his own title and content. To do so,
change the body of the request into this JSON:
```json
{
    "title": "Cool article",
    "content": "Cool article content"
}
```

To make Typetron take this JSON we should add a form. Create a directory called `Forms` and add the
`ArticleForm.ts` file with this content:
```ts
import { Field, Form } from '@Typetron/Forms';

export class ArticleForm extends Form {

    @Field()
    title: string;

    @Field()
    content: string;
}
```

Forms make it easy to organise and validate the data coming from users. Having this, we can use this form in
our controller like this:

```ts
// ...
import { ArticleForm } from 'App/Forms/ArticleForm';

@Controller()
export class HomeController {

    // ...

    @Post()
    async add(form: ArticleForm) {
        const article = new Article(form);
        await article.save();
        return article;
    }
}
```

#### Updating and deleting articles

Since we already have a form in place, we can easily add an update and a delete action to our controller
like this:

```ts
// ...

@Controller()
export class HomeController {

    // ...

    @Put('{article}')
    async update(article: Article, form: ArticleForm) {
        article.fill(form);
        await article.save();
        return article;
    }

    @Delete('{article}')
    async delete(article: Article) {
        await article.delete();
    }
}
```

In the next part we will use the Article entity to make searching for articles more interesting like making
use of query parameters or ordering results. >>>>>> [Searching](/tutorials/search).
