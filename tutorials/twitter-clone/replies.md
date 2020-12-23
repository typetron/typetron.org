---
layout: twitter-clone

title: Replying to tweets
---

## {{page.title}}

The reply functionality is even easier that the like one. We don't even have to create an entity because, technically, a
reply is a tweet, so we can use the _Tweet_ entity as an actual tweet and also as a reply to a tweet.

#### Updating the Tweet entity

We will have to add a self referencing relationship to our _Tweet_ entity:

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

    @Relation(() => Tweet, 'replyParent')
    replies: HasMany<Tweet>

    @CreatedAt()
    createdAt: Date
}
```

This might be a bit confusing but let's explain what is happening. We added the _replyParent_ column which is actually
the id of the parent tweet. The _replies_ relationship is the inverse of the _replyParent_. It will give us all the
replies of a tweet.

#### Adding the reply functionality

The only thing we need to so is to add a new property in the _TweetForm_ called _replyParent_ that can be the id of the
tweet we want to create a reply on. Also, we need to update the _TweetController_ to add this id in the newly created
tweet:

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
            user: this.user
        })
    }
}
```

The last thing we need to do, is to update the endpoint that returns all the tweets, to show the replies count of a
tweet:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import {Tweet as TweetModel } from 'App/Models/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    async tweets() {
        const tweets = await Tweet
            .with('user', ['likes', query => query.where('userId', this.user.id)])
            .withCount('likes', 'replies')
            .orderBy('createdAt', 'DESC')
            .get()
        
        return TweetModel.from(tweets)
    }
}
```

Before we wrap up this step, let's also add one more thing. If you used Twitter before, you would know that you can see
a reply's parent with its content and user. Let's add this functionality in our _HomeController_ that :

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
                ['likes', query => query.where('userId', this.user.id)]
            )
            .withCount('likes', 'replies')
            .orderBy('createdAt', 'DESC')
            .get()
        
        return TweetModel.from(tweets)
    }
}
```

Here we deeply eager-load relationships. This will return the parent of replies and its user as well. Let's also update
the _Tweet_ model:

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
    replyParent?: Tweet

    @Field()
    repliesCount = 0

    @Field()
    createdAt: Date
}
```

<div class="tutorial-next-page">
    In the next part we will add the ability to retweet a tweet

    <a href="retweets">
        <h3>Next ></h3>
        Retweeting tweets
    </a>

</div>

