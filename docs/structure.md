---
layout: docs
title: Directory Structure
---

## {{ page.title }}

#### The `config` directory
The configuration for every major module is written in a specific file in this directory. 

#### The `Controllers` directory
Here are all the endpoints in your app for handling HTTP, Websocket or GraphQL requests.

#### The `Entities` directory
Here are all the entities that talk with the database directly. Each table should have it's own entity.

#### The `Forms` directory
All the data that enters your all need to be validated for security reasons. The _Forms_ directory is the place
to add all of your app's forms.

#### The `Middleware` directory
Sometimes you need to intercept and/or modify the request of the response of your app. You would do that by creating
middleware classes and add them in the _Middleware_ directory.

#### The `Models` directory
Your app would also send back data to clients. To have control of the data your app exposes, you would create a
model class placed in this directory.

#### The `node_modules` directory
All of the app dependencies are going here after installing the using _npm install_.

#### The `Providers` directory
Providers are a great way to customize and bootstrap your app with custom configuration.

#### The `public` directory
All the images, videos, assets and frontend related files should go in the _public_ directory. We recommend making them
available to clients using a proxy server like [NGINX](https://www.nginx.com/). 

#### The `Services` directory
It is recommended that all the business logic of the app should be decoupled from the app and placed in specialised
classes called Services in this directory.

#### The `test` directory
All of your Unit tests, Integration tests etc. should be added here.
