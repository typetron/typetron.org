---
layout: tutorials
title: Routing
---

## {{ page.title }}

To see from where does Typetron render the pages from, we can take a look at `HomeController.ts` located in the 
`Controllers/Http` directory. Here we cam see a the `HomeController` class with the method `welcome` that returns
the contents of the `public/index.html` file.

A controller is a simple class annotated with the `@Controller()` decorator that contains methods that respond 
to different HTTP requests. In this case the `HomeController` has one method, `welcome`, that is called wherever
a GET request is made to `http://localhost:8000`. The HTTP Method is enforced by the `@Get()` decorator.

We can also return objects or a list of objects in this action/method. Let's return a list of objects containing
the titles of some articles:

```ts
import { Controller, Get } from '@Typetron/Router';

@Controller()
export class HomeController {

    @Get()
    welcome() {
        return [
            {
                title: "Making a healthy breakfast"
            },
            {
                title: "Top easiest dinners"
            }
        ];
    }
}
```

##### Adding a new route

In order to add a new route to our app we just need to add a method/action to our controller. For example, let's
add a route that will return the details of an article:
 
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

Going to `http://localhost:8000/article` will show a JSON string with the data from our article object.

We can make our route smarter by changing `article` inside `@Get('article')` to a route parameter: 

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

Going to `http://localhost:8000/1` will show a JSON string like this one:
```json
{
    "id": "This is article with ID #1",
    "title": "Making a healthy breakfast",
    "content": "Content of this article here..."
}
```

We can also create routes that respond to HTTP POST requests using the `@Post` decorator: 

```ts
import { Controller, Post } from '@Typetron/Router';

@Controller()
export class HomeController {

    // ...

    @Post()
    add() {
        return "this route will add an article";
    }
}
```

We can get this message back if we make a Post request to `http://localhost:8000` using Postman:

///////////// image here with postman post request 

In the next part we will take a look at Forms and how can we use them to capture and validate user 
input >>>>>> [Forms](/tutorials/forms).
