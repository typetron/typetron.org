---
layout: twitter-clone
title: Liking tweets
---

## {{page.title}}

Liking a tweet is easy enough. We just need a database table to hold the likes for each individual tweet. 

#### Creating the Like entity
Let's create an entity that will hold the likes of tweets:

```file-path
📁 Entities/Like.ts
```
```ts
import { CreatedAt, Entity, Options, PrimaryColumn, Relation, BelongsTo } from '@Typetron/Database'
import { Tweet } from 'App/Entities/Tweet';
import { User } from 'App/Entities/User';

@Options({
    table: 'likes'
})
export class Like extends Entity {
    @PrimaryColumn()
    id: number;

    @Relation(() => Tweet, 'likes')
    tweet: BelongsTo<Tweet>;

    @Relation(() => User, 'likes')
    user: BelongsTo<User>;

    @CreatedAt()
    createdAt: Date;
}
```

Let's also update the Tweet and User entities to reflect this change:

```file-path
📁 Entities/User.ts
```
```ts
import { Column, Options, Relation, HasMany } from '@Typetron/Database'
import { User as Authenticable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'

@Options({
    table: 'users'
})
export class User extends Authenticable {
    @Column()
    name: string

    @Relation(() => Like, 'user')
    likes: HasMany<Like>

    @Relation(() => Tweet, 'user')
    tweets: HasMany<Tweet>

}
```

```file-path
📁 Entities/Tweets.ts
```
```ts
import { BelongsTo, Column, CreatedAt, Entity, HasMany, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { User } from './User'
import { Like } from './Like'

@Options({
    table: 'tweets'
})
export class Tweet extends Entity {
    @PrimaryColumn()
    id: number

    @Column()
    content: string

    @Relation(() => User, 'tweets')
    user: BelongsTo<User>

    @Relation(() => Like, 'tweet')
    likes: HasMany<Like>

    @CreatedAt()
    createdAt: Date
}
```


#### Liking tweets action
What we need to do in the controllers, is to create a like entry if a user calls the like endpoint for the first time.
If the user calls this endpoint a second time, we need to remove the like entry from the database. This endpoint will
act as a toggle for likes. Let's add this functionality in our _TweetController_:

```file-path
📁 Controllers/TweetController.ts
```
```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { TweetForm } from 'App/Forms/TweetForm'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Like } from 'App/Entities/Like'

@Controller('tweet')
@Middleware(AuthMiddleware)
export class TweetController {

    @AuthUser()
    user: User

    @Post()
    async create(form: TweetForm) {
        // ...
    }

    @Post(':Tweet/like')
    async like(tweet: Tweet) {
        const like = await Like.firstOrNew({tweet, user: this.user})
        if (like.exists) {
            await like.delete()
        } else {
            await like.save()
        }

        return tweet
    }
}

```

_Like.firstOrNew_ will try to find an entry in the database with the properties given. If doesn't find any, it will
it create a new like instance with the same properties. Find more about the [ORM here](/docs/database) 

The next thing we need to do, is to update the endpoint that returns all the tweet to show the likes count of a tweet:

```file-path
📁 Controllers/HomeController.ts
```
```ts
import { Controller, Get, Middleware } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    async tweets() {
        return Tweet.with('user').withCount('likes').orderBy('createdAt', 'DESC').get()
    }
}
```

The _withCount_ method will return all the tweets with their properties but also and additional property _likesCount_
which is the number of likes a tweet has.


One last thing we need to add is to return some sort of information if the currently logged-in user liked a tweet or not.
Let's update the _HomeController_, and then we can talk about the code:

```file-path
📁 Controllers/HomeController.ts
```
```ts
import { Controller, Get, Middleware, Query } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { User } from 'App/Entities/User'
import { AuthUser } from '@Typetron/Framework/Auth'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @AuthUser()
    user: User

    @Get()
    async tweets() {
        return Tweet
            .with('user', ['likes', query => query.where('userId', this.user.id)])
            .withCount('likes')
            .orderBy('createdAt', 'DESC')
            .get()
    }
}
```

We eager-load the likes of tweets, but we filter down the likes to only those from the currently logged-in user. This 
means if I like a tweet, that tweet will have exactly one entry in the _likes_ property, otherwise it will be an
empty array.

<div class="tutorial-next-page">
    In the next part we will add the ability to reply to a tweet

    <a href="tweets">
        <h3>Next ></h3>
        Replying to tweets
    </a>

</div>

