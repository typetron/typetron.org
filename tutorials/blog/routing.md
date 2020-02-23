---
layout: tutorial
title: Routing
hide_title_suffix: true
---

## {{ page.title }}

To see from where does Typetron render the pages from, we can take a look at **HomeController.ts** located in
the **Controllers/Http** directory. Here we can see the **welcome** method that returns the contents of the
**public/index.html** file.

A controller is a simple class annotated with the **@Controller()** decorator that contains methods that 
respond to different HTTP requests. In this case, the **HomeController** has one method, **welcome**, that is
called whenever a **GET** request is made to [localhost:8000](http://localhost:8000). The HTTP Method is 
enforced by the **@Get()** decorator.

We can also return objects or a list of objects in this action/method. Let's return a list of objects 
containing the titles of some articles:

```ts
import { Controller, Get } from '@Typetron/Router';

@Controller()
export class HomeController {

    @Get()
    welcome() {
        return [
            {
                title: 'Making a healthy breakfast'
            },
            {
                title: 'Protein rich meal for gym'
            }
        ];
    }
}
```
I recommend using a JSON formatting extension for your browser in order to see the JSON better.
I am using Google Chrome browser with the JSON Viewer extension and the response looks like this:

<p align="center">
  <img src="/images/tutorials/blog/first-route.jpg" />
</p>

##### Adding a new route

In order to add a new route to our app we just need to add a method/action to our controller. For example, 
let's add a route that will return the details of an article:
 
```ts
import { Controller, Get } from '@Typetron/Router';

@Controller()
export class HomeController {

    // ...

    @Get('article')
    read() {
        return {
            title: 'Making a healthy breakfast',
            content: 'Content of this article here...'
        };
    }
}
```

Going to [localhost:8000/article](http://localhost:8000/article) will show a JSON string with the data from
our article object.

We can make our route smarter by changing **article** inside **@Get('article')** to **{id}**, making it a 
route parameter: 

```ts
import { Controller, Get } from '@Typetron/Router';

@Controller()
export class HomeController {

    // ...

    @Get('{id}')
    read(id: number) {
        return {
            id: 'This is article with ID #' + id,
            title: 'Making a healthy breakfast',
            content: 'Content of this article here...'
        };
    }
}
```

Going to [localhost:8000/1](http://localhost:8000/1) will show a JSON string like this one:
```json
{
    "id": "This is article with ID #1",
    "title": "Making a healthy breakfast",
    "content": "Content of this article here..."
}
```

We can also create routes that respond to HTTP POST requests using the **@Post()** decorator: 

```ts
import { Controller, Post } from '@Typetron/Router';

@Controller()
export class HomeController {

    // ...

    @Post()
    add() {
        return 'this route will add an article';
    }
}
```

We can get this message back if we make a Post request to [localhost:8000](http://localhost:8000) using Postman:

<p align="center">
  <img src="/images/tutorials/blog/post-request.jpg" />
</p>


In the next part we will take a look at Forms and how can we use them to capture and validate user 
input >>>>>> [Forms](forms).

