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
import { ID, CreatedAt, Entity, Options, PrimaryColumn, Relation, BelongsTo } from '@Typetron/Database'
import { Tweet } from 'App/Entities/Tweet'
import { User } from 'App/Entities/User'

@Options({
    table: 'likes'
})
export class Like extends Entity {
    @PrimaryColumn()
    id: ID

    @Relation(() => Tweet, 'likes')
    tweet: BelongsTo<Tweet>

    @Relation(() => User, 'likes')
    user: BelongsTo<User>

    @CreatedAt()
    createdAt: Date
}
```

Let's also update the Tweet and User entities to reflect this change:

```file-path
📁 Entities/User.ts
```

```ts
import { Column, Options, Relation, HasMany } from '@Typetron/Database'
import { User as Authenticatable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'

@Options({
    table: 'users'
})
export class User extends Authenticatable {
    @Column()
    name: string

    @Relation(() => Like, 'user')
    likes: HasMany<Like>

    @Relation(() => Tweet, 'user')
    tweets: HasMany<Tweet>

}
```

```file-path
📁 Entities/Tweet.ts
```

```ts
import { ID, BelongsTo, Column, CreatedAt, Entity, HasMany, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { User } from './User'
import { Like } from './Like'

@Options({
    table: 'tweets'
})
export class Tweet extends Entity {
    @PrimaryColumn()
    id: ID

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
act as a toggle for likes. Let's add this functionality in our _TweetsController_:

```file-path
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { TweetForm } from 'App/Forms/TweetForm'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Like } from 'App/Entities/Like'

@Controller('tweets')
@Middleware(AuthMiddleware)
export class TweetsController {

    @AuthUser()
    user: User

    @Post()
    create(form: TweetForm) {
        return TweetModel.from(
            Tweet.create({
                content: form.content,
                user: this.user
            })
        )
    }

    @Post(':Tweet/like')
    async like(tweet: Tweet) {
        const like = await Like.firstOrNew({tweet, user: this.user})
        if (like.exists) {
            await like.delete()
        } else {
            await like.save()
        }

        return TweetModel.from(tweet)
    }
}

```

_Like.firstOrNew_ will try to find an entry in the database with the given properties. If doesn't find any, it will it
create a new Like instance with the same properties, without saving it in the database. Find more about
the [ORM here](/docs/database)

Let's make a request to this endpoint to add a like to a tweet:

```file-path
🌐 [POST] /tweets/{tweet id}/like
```

The next thing we need to do, is to update the endpoint that returns all the tweets, so it shows the amount of likes for
each tweet:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    async tweets() {
        const tweets = await Tweet
            .with('user')
            .withCount('likes')
            .orderBy('createdAt', 'DESC')
            .get()

        return TweetModel.from(tweets)
    }
}
```

The _withCount_ method will return all the tweets with their properties but also an additional property _likesCount_,
which is the number of likes a tweet has.

One last thing we need to add is to return some sort of information if the currently logged-in user liked a tweet or
not. Let's update the _HomeController_, and then we can talk about the code:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware, Query } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Tweet as TweetModel } from 'App/Models/Tweet'
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
        const tweets = await Tweet
            .with('user', ['likes', query => query.where('userId', this.user.id)])
            .withCount('likes')
            .orderBy('createdAt', 'DESC')
            .get()

        return TweetModel.from(tweets)
    }
}
```

We eager-load the likes of tweets, but we filter down the likes to only those from the currently logged-in user. This
means if I like a tweet, that tweet will have exactly one entry in the _likes_ property, otherwise it will be an empty
array.

Let's add a model for the _Like_ entity as well and update our _Tweet_ model:

```file-path
📁 Models/Like.ts
```

```ts
import { Field, Model } from '@Typetron/Models'
import { User } from './User'

export class Like extends Model {
    @Field()
    id: number

    @Field()
    user: User
}
```

```file-path
📁 Models/Tweet.ts
```

```ts
import { Field, Model, FieldMany } from '@Typetron/Models'
import { User } from './User'
import { Like } from './Like'

export class Tweet extends Model {
    @Field()
    id: number

    @Field()
    content: string

    @Field()
    user: User

    @FieldMany(Like)
    likes: Like[] = []

    @Field()
    likesCount = 0

    @Field()
    createdAt: Date
}
```

Now, we should see a cleaner response when making a request to _[GET] http://localhost:8000/_

<div class="tutorial-next-page">
    In the next part we will add the ability to reply to a tweet

    <a href="replies">
        <h3>Next ></h3>
        Replying to tweets
    </a>

</div>

