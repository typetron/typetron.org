---
layout: twitter-clone
slug: tutorial-twitter-clone
---

## Introduction
In this tutorial we will build a [Twitter](https://twitter.com/home) clone app called Tweetee, like the on shown in the images below.
We will begin with the backend part of the app, and then we will finish by creating the frontend part with a framework of your choice.

<div id="carouselExampleCaptions" class="carousel slide" data-ride="carousel">
  <ol class="carousel-indicators">
    <li data-target="#carouselExampleCaptions" data-slide-to="0" class="active"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="1"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="2"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="3"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="4"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="5"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="6"></li>
  </ol>
  <div class="carousel-inner">
    <div class="carousel-item active">
        <div class="window">
        <img src="/images/tutorials/twitter-clone/preview1.png" class="d-block w-100">
        </div>
    </div>
    <div class="carousel-item">
      <div class="window">
        <img src="/images/tutorials/twitter-clone/preview2.png" class="d-block w-100">
      </div>
    </div>
    <div class="carousel-item">
      <div class="window">
        <img src="/images/tutorials/twitter-clone/preview3.png" class="d-block w-100">
      </div>
    </div>
    <div class="carousel-item">
      <div class="window">
        <img src="/images/tutorials/twitter-clone/preview4.png" class="d-block w-100">
      </div>
    </div>
    <div class="carousel-item">
      <div class="window">
        <img src="/images/tutorials/twitter-clone/preview5.png" class="d-block w-100">
      </div>
    </div>
    <div class="carousel-item">
      <div class="window">
        <img src="/images/tutorials/twitter-clone/preview6.png" class="d-block w-100">
      </div>
    </div>
    <div class="carousel-item">
      <div class="window">
        <img src="/images/tutorials/twitter-clone/preview7.png" class="d-block w-100">
      </div>
    </div>
  </div>
  <a class="carousel-control-prev" data-target="#carouselExampleCaptions" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" data-target="#carouselExampleCaptions" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
  </a>
</div>


Before diving into the backend part with Typetron, let's lay down the idea on paper, so we know what to follow. We will have:
- a Home page that will display the latest tweet from the platform based on the people you are following
- an Explore page what will show the latest tweets from the platform based on what topics you've selected
- a Notifications page that will show you the latest interactions on you and on your tweets, like new followers or tweets likes.
- a Profile page where you can see a user's information, tweets and interact with him
 
Some features of Tweetee will be:
- ability to tweet
- ability to like, comment and retweet on an existing tweet
- ability to change your profile's information like name, profile picture, cover image, bio information and topics
- ability to follow and unfollow people
- ability to add images to a tweet  
- ability to edit your preferred topics  
 
With this in mind we can start building Tweetee now 😄.
 
##### Preparing the environment

Typetron is a framework that runs on top of Node.js. This means you should have [Node.js](https://nodejs.org/)
installed on your computer. Also, make sure you have [Git](https://git-scm.com/) installed as well, since it will be 
used to create the project. 

##### Creating a project

Open your terminal and run the following command that will create a directory called _Tweetee_ in the current directory:

```bash
$ git clone https://github.com/typetron/typetron Tweetee
```
 
Next, we will go into that project's directory and install all the required dependencies:
```bash
$ cd Tweetee
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
    In the next part we will create the endpoint that will add a tweet in the app
    
    <a href="tweets">
        <h3>Next ></h3>
        Tweets
    </a>
</div>

