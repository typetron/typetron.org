---
layout: blog
title: Routing
hide_title_suffix: true
---

## {{ page.title }}

To see where does Typetron render the pages from, we can take a look at _HomeController.ts_ located in
the _Controllers/Http_ directory. Here we can see the _welcome_ method that returns the contents of the
_public/index.html_ file.

A [controller](/docs/controllers) is a simple class annotated with the _@Controller()_ decorator. It contains methods that 
respond to different HTTP requests. In this case, the _HomeController_ has one method, _welcome_, that is
called whenever a _GET_ request is made to [localhost:8000](http://localhost:8000). The HTTP method is 
enforced by the _@Get()_ decorator.

We can also return objects or a list of objects in this method (methods are also known as actions). 
Let's return a dummy list of objects containing the titles of some articles. Replace the existing _welcome_ method with
this:

```file-path
📁 Controllers/Http/HomeController.ts
```
```ts
import { Controller, Get } from '@Typetron/Router'

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
        ]
    }
}
```
I recommend using a JSON formatting extension for your browser in order to easily see the JSON.
For example, if you are using Google's Chrome browser, you can install the [JSON Viewer](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh)
extension.

```json
[
    {
        "title": "Making a healthy breakfast"
    },
    {
        "title": "Protein rich meal for gym"
    }
]
```

##### Adding a new route

In order to add a new route to our app we just need to add a method to our controller and annotate it with the 
appropriate decorator: _@Get()_, _@Post()_, _@Patch()_, _@Put()_ or _@Delete()_. For example, let's add a route that will return the details of an article:
 
```file-path
📁 Controllers/Http/HomeController.ts
```
```ts
import { Controller, Get } from '@Typetron/Router'

@Controller()
export class HomeController {

    @Get()
    welcome() {
        // ...
    }

    @Get('article')
    read() {
        return {
            title: 'Making a healthy breakfast',
            content: 'Content of this article here...'
        }
    }
}
```

Going to [localhost:8000/article](http://localhost:8000/article) will show a JSON string with the data from
our article object.

We can make our route smarter by changing 'article' inside _@Get('article')_ to _:id_, making it a 
[route parameter](/docs/controllers#route-parameters): 

```file-path
📁 Controllers/Http/HomeController.ts
```
```ts
import { Controller, Get } from '@Typetron/Router'

@Controller()
export class HomeController {

    @Get()
    welcome() {
        // ...
    }

    @Get(':id')
    read(id: number) {
        return {
            id: 'This is article with ID #' + id,
            title: 'Making a healthy breakfast',
            content: 'Content of this article here...'
        }
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

We can also create routes that respond to HTTP POST requests using the _@Post()_ decorator: 

```file-path
📁 Controllers/Http/HomeController.ts
```
```ts
import { Controller, Post } from '@Typetron/Router'

@Controller()
export class HomeController {

    // ...

    @Post()
    add() {
        return 'this route will add an article'
    }
}
```
In order to make POST requests easier, you will need a tool from where you can make complex requests to a server, like 
[Postman](https://getpostman.com/). It is a popular tool used in web development when working with APIs.
It is only needed in the development phase.

> _**Note**_ Would you like us to make tutorials on how to use and master Postman? Leave a message using the 
> chat box in the right bottom corner or email us at _contact@typetron.org_. 
    
Now, we can get the message from the route created earlier:

<p align="center" class="window">
  <img src="/images/tutorials/blog/post-request.jpg" />
</p>

HTTP Post requests are usually used to receive data from the user and save it in the database. This means that the user
can write everything he want in the content of the request. This is why we need to validate the data every time we get
something from the user.
 

<div class="tutorial-next-page">
    In the next part we will take a look at Forms and how can we use them to capture and validate user input. 
    
    <a href="forms">
        <h3>Next ></h3>
        Forms
    </a>
</div>
