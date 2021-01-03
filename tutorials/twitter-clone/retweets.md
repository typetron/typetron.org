---
layout: twitter-clone

title: Retweeting tweets
---

## {{page.title}}

The retweet functionality is almost 100% similar to the reply one. This is because a retweet is almost the same thing as
a reply, with a key difference: retweets act also like a share on a user's profile.

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

This might be a bit confusing but let's explain what is happening. We added the _retweetParent_ column which is actually
the id of the parent tweet. The _retweets_ relationship is the inverse of the _retweetParent_. It will give us all the
retweets of a tweet.

#### Adding the retweet functionality

As like in the last step, we just need to update the _TweetForm_ and the _TweetsController_:

```file-path
📁 Forms/TweetForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'

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
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'
import { TweetForm } from 'App/Forms/TweetForm'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'

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
                replyParent: form.replyParent,
                retweetParent: form.retweetParent,
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

Let's make a request with the _retweetParent_ property to add a retweet to a tweet:

```file-path
🌐 [POST] /tweets
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
import { Controller, Get, Middleware } from '@Typetron/Router'
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

