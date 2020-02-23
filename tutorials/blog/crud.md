---
layout: tutorial
title: Crud
---

## Creating, updating and deleting

After we created the **Article** entity, we can now go and create the methods/actions that will take care of handling
the user's requests. In our case, a user wants to see the latest articles in the blog. Let's add a method inside
**HomeController** that will do just that. Remove the **welcome** method (which is just a dummy method) and add this: 

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

The **@Get()** decorator will register a route inside Typetron that will respond to HTTP GET requests.

The **Article.get()** will go inside the database and select everything from the **articles** table and return the
result to the user. This is similar with making a SQL select like this:`SELECT * from articles`. Now, if we go inside
the browser we should see the articles in a JSON format.

#### Showing one article

Let's imagine a user will click on the first article since we don't have a frontend yet. In this case, our app
should display the contents of that article. Let's add a method inside **HomeController** again, that will 
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

By giving the **@Get** decorator the parameter **{id}**, Typetron will register a method that will handle all the
requests to **/something** where that **something** is our article identifier.

Now, if you go to [localhost:8000/1](http://localhost:8000/1) you will see all the contents of a the article with 
**id** 1. If you change that 1 into 2, you will see the contents of article 2 and so on.

We can also use Route-Entity binding where Typetron will find the Entity for you based on the name of the route
parameter and the name of the entity:

```ts
// ...

@Controller()
export class HomeController {

    // ...

    @Get('{article}')
    async read(article: Article) {
        return article;
    }
}
```

Passing **article** as a route parameter and **Article** as a method argument, Typetron will do a **Article.find()** for
us. 

#### Creating an article

Our app can display all the articles or one particular article. Let's make it more interesting and add the 
ability to create an article. To do that, add a method inside **HomeController** with this piece of code:

```ts
// ...

@Controller()
export class HomeController {

    // ...

    @Post()
    async add() {
        const article = new Article();
        article.title = 'My awesome article';
        article.content = 'My awesome content';
        await article.save();
        return article;
    }
}
```

The **@Post()** decorator will register a route that will handle all the HTTP POST requests.
Since we don't have a frontend with a form that we can fill we can't make such requests from our browser but we can use
[Postman](https://www.getpostman.com/) for that. There, we can change the HTTP Method to POST and write the url we want
to post to, which is **localhost:8000**. If we run this request and check our database we will see the we will have a 
new article with the title _My awesome article_. Actually, every time we run that request we will create such article. 

Let's make it even more interesting and add the user the ability to add his own title and content. To do so,
change the body of the request into this JSON:
```json
{
    "title": "Cool article",
    "content": "Cool article content"
}
```

To make Typetron take this JSON we should use the form we created earlier. Forms make it easy to organise and validate
the data coming from users. Having this, we can use this form in our controller like this:

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

We can easily add an update and delete action to our controller:

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

In the next part we will implement a simple frontend that will show our personal blog >>>>>> [Frontend](frontend).
