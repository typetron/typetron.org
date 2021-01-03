---
layout: docs

title: Installation
---

## {{ page.title }}

### Requirements

Before you start using Typetron, make sure you have [Node.js LTS](https://nodejs.org) installed.

### Installation

To start using Typetron, clone the blank project from Github:
```sh
$ git clone https://github.com/typetron/typetron my-awesome-project
```
> **_Note_** Typetron will have a CLI tool in the future to make managing projects easier. You will be able to
> do create new project using commands like this: `$ typetron new TypetronBlog`

Go into your project's directory and install the required dependencies:
```sh
$ cd my-awesome-project
$ npm install
```

In order to create a server that will serve your project, you can run the _start_ script from _package.json_:
```sh
$ npm start
```
 
This will create a development server on you machine that automatically reloads the app when you make code changes.
You can open you app at [http://localhost:8000](http://localhost:8000).

### Next steps
We recommend you go to the [Tutorials](/tutorials) section if you are just getting started with Typetron. 
