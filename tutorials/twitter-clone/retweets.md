---
layout: twitter-clone

title: Retweeting tweets
---

## {{page.title}}

The reply functionality is almost 100% similar to the reply one. This is because a retweet is almost the same thing as a
reply, with a few key differences.

#### Updating the Tweet entity

We will have to add another self referencing relationship to our _Tweet_ entity:

```file-path
📁 Entities/Tweet.ts
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

    @Relation(() => Tweet, 'replies')
    replyParent: BelongsTo<Tweet>

    @Relation(() => Tweet, 'retweets')
    retweetParent: BelongsTo<Tweet>

    @Relation(() => Tweet, 'replyParent')
    replies: HasMany<Tweet>

    @Relation(() => Tweet, 'retweetParent')
    retweets: HasMany<Tweet>

    @CreatedAt()
    createdAt: Date
}
```

This might be a bit confusing but let's explain what is happening. We added the _replyParent_ column which is actually
the id of the parent tweet. The _replies_ relationship is the inverse of the _replyParent_. It will give us all the
replies of a tweet.

#### Adding the retweet functionality

As like in the last step, we just need to update the _TweetForm_ and the _TweetController_:

```file-path
📁 Forms/TweetForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'
import { File } from '@Typetron/Storage'

export class TweetForm extends Form {
    @Field()
    @Rules(Required)
    content: string

    @Field()
    replyParent?: number

    @Field()
    retweetParent?: number
}
```

```file-path
📁 Controllers/Http/TweetController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { TweetForm } from 'App/Forms/TweetForm'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'

@Controller('tweet')
@Middleware(AuthMiddleware)
export class TweetController {

    @AuthUser()
    user: User

    @Post()
    create(form: TweetForm) {
        return Tweet.create({
            content: form.content,
            replyParent: form.replyParent,
            retweetParent: form.retweetParent,
            user: this.user
        })
    }
}
```

Let's make a request with the _retweetParent_ property to add a retweet to a tweet:

```file-path
🌐 [POST] /tweet
```

```json
{
    "content": "my tweet content",
    "retweetParent": 1
}
```

The last thing we need to do, is to update the endpoint that returns all the tweets to show the retweets count of a
tweet. We also need to return the parent of a retweet and its user:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware, Query } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import {Tweet as TweetModel } from 'App/Models/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { User } from 'App/Entities/User'
import { AuthUser } from '@Typetron/Framework/Auth'
import { EntityQuery } from '@Typetron/Database/EntityQuery'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @AuthUser()
    user: User

    @Get()
    async tweets() {
        const tweets = await Tweet
            .with(
                'user',
                'replyParent.user',
                'retweetParent.user',
                ['likes', query => query.where('userId', this.user.id)]
            )
            .withCount('likes', 'replies', 'retweets')
            .orderBy('createdAt', 'DESC')
            .get()

        return TweetModel.from(tweets)
    }
}
```

Let's not forget to update the _Tweet_ model with the newly added properties:

```file-path
📁 Models/Tweet.ts
```

```ts
import { Field, FieldMany, Model } from '@Typetron/Models'
import { User } from './User'
import { Like } from './Like'

export class Tweet extends Model {
    @Field()
    id: number

    @Field()
    content: string

    @Field()
    user: User

    @Field()
    likesCount = 0

    @FieldMany(Like)
    likes: Like[] = []

    @Field()
    retweetsCount = 0

    @Field()
    replyParent?: Tweet

    @Field()
    retweetParent?: Tweet

    @Field()
    repliesCount = 0

    @Field()
    createdAt: Date
}
```

<div class="tutorial-next-page">
    In the next part we will upload images on tweet

    <a href="images">
        <h3>Next ></h3>
        Uploading images
    </a>

</div>

