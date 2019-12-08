---
layout: tutorials
title: Tutorial Introduction
---

## {{ page.title }}
    
This is a tutorial to building apps in Typetron, alpha version. We will build the backend of a small blog
where users can read articles, add articles, comment and vote them.

Before diving into Typetron, let's lay out the idea on paper. First of all, our API will return all the latest
articles for the users to view. So far we have two things (two entities) to work with: an User and an 
Article. An User has a name, an email address and a password and an Article has a title, content and date of
creation.

_Join the [newsletter](/) to be first to know when new features, tutorials and news are released_ 

##### Preparing the environment

Typetron is a framework that runs on top of Node.js. This means we should install [Node.js](https://nodejs.org/)
on our computer. Also, make sure you have [Git](https://git-scm.com/) installed as well. For this tutorial you
will need a tool from where you can make complex requests to a server, like [Postman](https://getpostman.com/).

> _**NOTE**_ Would you like us to make tutorial on how to use and master Postman? Leave a message using the 
> chat box below or email us at `contact@typetron.org`. 
    
##### Creating a project

Now we are ready to start our first Typetron project. Let's call it "TypetronBlog". Open your terminal and run
the following command that will create a directory called `TypetronBlog` on the current directory:

```bash
$ git clone https://github.com/typetron/typetron TypetronBlog
```
> **_Note_** Typetron will have a CLI tool in the future to make managing projects easier.
 
Next, we go into that project's directory and install all the required dependencies:
```bash
$ cd TypetronBlog
$ npm install
```

After this we can start the project:
```bash
$ npm start
```
This will create a local development server on port 8000.
Let's visit [http://localhost:8000](http://localhost:8000) and voila, our blank Typetron project is ready.

/////////////////////// image here

In the next part we will take a look at how Typetron shows this page. >>>>>> [Routing](/tutorials/routing).
