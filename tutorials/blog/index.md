---
layout: tutorial
slug: personal-blog-introduction
---

## Introduction
    
In this tutorials we will build a small personal blog where you can post articles and your users can read, add,
 comment and vote them.

Before diving into Typetron, let's lay down the idea on paper. Will will have:
 - a home page that will display a list of the latest articles. An article has a title and  content.
 - an about page with personal information 
 - a blog page that will display all the articles available. Also, users can search articles here.
 
And that's it. A very simple web app.
 
##### Preparing the environment

Typetron is a framework that runs on top of Node.js. This means we should have [Node.js](https://nodejs.org/)
installed on our computer. Also, make sure you have [Git](https://git-scm.com/) installed as well. For this 
tutorial you will need a tool from where you can make complex requests to a server, like 
[Postman](https://getpostman.com/). It is only needed in the development phase.

> _**NOTE**_ Would you like us to make tutorial on how to use and master Postman? Leave a message using the 
> chat box in the right bottom corner or email us at **contact@typetron.org**. 
    
##### Creating a project

Now we are ready to start our first Typetron project. Let's call it "TypetronBlog". Open your terminal and run
the following command that will create a directory called **TypetronBlog** on the current directory:

```bash
$ git clone https://github.com/typetron/typetron TypetronBlog
```
> **_Note_** Typetron will have a CLI tool in the future to make managing projects easier. You will be able to
> do create new project using commands like this: **$ typetron new TypetronBlog** 
 
Next, we will go into that project's directory and install all the required dependencies:
```bash
$ cd TypetronBlog
$ npm install
```

After this, we can start the project:
```bash
$ npm start
```
This will create a local development server on port 8000.
Let's visit [http://localhost:8000](http://localhost:8000) and voila, our blank Typetron project is ready.

<p align="center">
  <img src="/images/tutorials/blog/new.jpg" />
</p>

In the next part we will take a look at how Typetron shows this page. >>>>>> [Routing](routing).

_Join the [newsletter](/) to be first to know when new features, tutorials and news are released_ 
