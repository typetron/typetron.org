---
layout: twitter-clone

slug: tutorial-twitter-clone
---

## Introduction

<video width="100%" controls>
    <source src="/assets/videos/tweetee.webm" type="video/webm">
</video>

In this tutorial we will build a [Twitter](https://twitter.com/home) clone app called Tweetee, like the on shown in the
images below. We will begin with the backend part of the app, and then we will finish by creating the frontend part with
a framework of your choice.

Before diving into the backend part with Typetron, let's lay down the idea on paper, so we know what to follow. We will
have:

- a Home page that will display the latest tweet from the platform based on the people you are following
- an Explore page what will show the latest tweets from the platform based on what topics you've selected
- a Notifications page that will show you the latest interactions on your tweets, like new followers or tweets likes.
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
installed on your computer.

##### Creating a project

Open your terminal, make sure you have the [Typetron CLI](/docs/installation) installed and run the following command
that will create a directory called _Tweetee_ in the current directory:

```bash
$ typetron new Tweetee
```

After this, we can start the project:

```bash
$ npm start
```

This will create a local development server on port 8000. Let's visit [http://localhost:8000](http://localhost:8000) and
voila, our blank Typetron project is ready.

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

