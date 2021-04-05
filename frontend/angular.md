---
layout: blank

title: Getting started with Typetron and Angular

keywords: getting started with angular frontend

description: getting started with angular frontend
---

### Using Typetron with Angular

Typetron is a batteries-included framework, meaning that it provides tools to not only create backend app but also help
you develop and link the backend with your frontend as easy as possible. In this section we will create a blank app that
uses Typetron on the backend and Angular on the frontend. 

These two apps will share source code between them, things like [Models](/docs/models), used to typehint the backend
responses and [Forms](/docs/forms), used to typehint and build forms with their validation.

In order to get started with Typetron and Angular make sure you have the necessary prerequisites on your machine:

- [Typetron CLI](/docs/installation)
- [Angular CLI](https://angular.io/cli)

Once you have all these installed, we can start creating our full-stack project. First, create a new Typetron project:

```bash
$ typetron new MyProject
$ cd MyProject
```

Once you've created that, create a new Angular project inside _MyProject_:

```bash
$ ng new frontend
```

We now have both Typetron and Angular app inside the _MyProject_ directory. This is a typical file structure:

```text
+-- MyProject
|   +-- config
|   +-- Controllers
|   +-- Entities
|   +-- Forms
|   +-- frontend <-- This is the Angular app
|      -- (Angular files and folders)
|   +-- migrations
|   +-- Models
|   +-- node_modules
|   +-- Providers
|   +-- public
|   +-- Services
|   +-- test
```

The only thing we need to do is to link them. Why do we want to link them? Because we want to use Models and Forms from
within the Typetron app inside the Angular app. To do so, we need to add a few packages to the Angular app:

1. Activate the [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) middleware inside Typetron in the
   _config/app.ts_ config file:
    ```ts
    import { AppConfig } from '@Typetron/Framework'
    import { CorsMiddleware } from '@Typetron/Framework/Middleware'
    
    export default new AppConfig({
        // ...
        middleware: [
            CorsMiddleware
        ],
        providers: [
            // ...
        ]
    })
    ```

2. Set Typescript path aliases in your _tsconfig.json_ in your Angular app. This will tell Angular where to find our
   Forms, Models and the Typetron framework internals. Don't worry. Angular won't import the entire Typetron framework
   in your Angular app. Angular will pick only what's necessary from it:
    ```json
    {
        "compilerOptions": {
            "other configs": "...",
            "baseUrl": "./",
            "paths": {
                "@Typetron/*": [
                    "../node_modules/@typetron/framework/*"
                ],
                "@Data/Models/*": [
                    "../Models/*"
                ],
                "@Data/Forms/*": [
                    "../Forms/*"
                ]
            }
        }
    }
    ```

3. Inside `src/main.ts` add the _reflect-metadata_ package. This package is used internally by Typetron to get
   information from decorators in our Models and Forms:
    ```ts
    import 'reflect-metadata'
    import { enableProdMode } from '@angular/core'
    // ...
    ```
   From this point we can start using Models in our Angular app. This way we don't have to write interfaces for
   responses we get from the backend side. For example, we can type-hint the http response:
    ```ts
    import {Component, OnInit} from '@angular/core'
    import {User} from '@Data/Models/User'
    import {HttpClient} from '@angular/common/http'
    
    @Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss']
    })
    export class AppComponent implements OnInit {
    
        users: User[] = []
    
        constructor(private http: HttpClient) {}
    
        async ngOnInit(): Promise<void> {
            this.users = await this.http.get<User[]>('http://localhost:8000/users').toPromise()
        }
    } 
    ```

4. (Optional ) If you want to automatically build Angular forms from Typetron forms, install the _@typetron/angular_
   package in your Angular app. This will help you transform Typetron Forms in Angular forms, so you don't have to write
   the same form with the same validation as on the backend side of things.
   ```bash
   $ npm install @typetron/angular
   ```
   You can use this package as follows:
   ```ts
    import { Component } from '@angular/core'
    import { RegisterForm } from '@Data/Forms/RegisterForm'
    import { FormBuilder } from '@typetron/angular'
    
    @Component({
        selector: 'app-my-component',
        templateUrl: './my-component.component.html',
        styleUrls: ['./my-component.component.scss']
    })
    export class TypetronFormBuilderComponent {
        registerForm = FormBuilder.build(RegisterForm)
    }
   ```

With this configuration you are now ready to take advantage of the entire power of Typetron.

Check the [tutorials](/tutorials) and [documentation](/docs) pages for more insights on Typetron.
