---
layout: blog
slug: personal-blog-introduction
---

## Introduction
    
In this tutorial we will build a small personal blog of a restaurant chef where he will be able to add, edit and delete
articles of different recipes.

Before diving into Typetron, let's lay down the idea on paper. Will will have:
 - a Home page that will display a list of the latest articles. An article has a title, date, content and an image.
 - an About page with personal information
 - a Contact page
 - a page that displays one article 
 - a page for adding and editing an article
 
That's it. A very simple web app.
 
##### Preparing the environment

Typetron is a framework that runs on top of Node.js. This means you should have [Node.js LTS](https://nodejs.org/)
installed on our computer. Also, make sure you have [Git](https://git-scm.com/) installed as well since it will be 
used to create the project. 

##### Creating a project

Now we are ready to start our first Typetron project. Let's call it "TypetronBlog". Open your terminal and run
the following command that will create a directory called _TypetronBlog_ in the current directory:

```bash
$ git clone https://github.com/typetron/typetron TypetronBlog
```
 
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

<p align="center" class="window">
  <img src="/images/tutorials/blog/new.jpg" />
</p>

_Join the [newsletter](/) to be first to know when new features, tutorials and news are released_
 
<div class="tutorial-next-page">
    In the next part we will take a look at how Typetron shows this page.
    
    <a href="routing">
        <h3>Next ></h3>
        Routing
    </a>
</div>

