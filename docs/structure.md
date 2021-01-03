---
layout: docs

title: Directory Structure
---

## {{ page.title }}

#### The `config` directory
The configuration for every major module is written in a specific file in this directory. For example, database specific
configurations are written inside _database.ts_ file.

#### The `Controllers` directory
Here are all the endpoints in your app for handling HTTP, Websocket or GraphQL requests. Each file in this directory
is a group of endpoints. Even thought you can have only one controller file for all of your endpoints, it is recommended
you create a controller file for each resource you have in your app.

#### The `Entities` directory
Here are all the entities that talk with the database directly. Each file here represents a table in the database. You
can find more about entities in the [ORM](/docs/orm) section of documentation.

#### The `Forms` directory
All the data sent to your app needs to be validated for security reasons. Based on the resource requested by the client,
you can organize the input data in [Forms](/docs/forms). You can add all the forms of your app in this directory.

#### The `Middleware` directory
Sometimes you need to intercept and/or modify the request or the response of your app. You would do that by creating
[Middleware](/docs/controllers) classes in this directory.

#### The `Models` directory
Your app would also send back data to clients. To have control of the data your app exposes, you would create a
[Model](/docs/models.md) class placed in this directory.

#### The `node_modules` directory
This is a Node.js specific directory that you should not change. All the app dependencies are placed here after
installing the using _npm install_.

#### The `Providers` directory
[Providers](/docs/providers) are a great way to customize and bootstrap your app with custom configuration in case 
there is no built-in configuration for what you need. You would also use providers when you want to integrate a
third-party package in your app.

#### The `public` directory
All the images, videos, assets and frontend related files visible to the client should go in the _public_ directory.
We recommend making them available to clients using a proxy server like [NGINX](https://www.nginx.com/) since it is even
faster than Typetron for serving static files. Files that need authentication should not be placed in this directory but
in a custom one.
You should serve those files manually from a controller that is behind authentication.

#### The `Services` directory
It is recommended that all the business logic of the app should be decoupled from controllers and placed in specialised
classes called Services in this directory. These services would then be easier to unit-test.

#### The `test` directory
All of your Unit tests, Integration tests etc. should be added here. You can run all the test from your app using
_$ npm run tests_
