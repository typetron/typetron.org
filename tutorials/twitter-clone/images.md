---
layout: twitter-clone

title: Adding images to tweets
---

## {{page.title}}

A tweet can have one or more images attached to it. We will save these images on disk, but we will need to save the name
of the image in the database. This means we need another database table to save the images names into. This new table
will need a new entity to be created.

#### Creating the Media entity

This entity will store the images and video names of tweets. We also need to update the _Tweet_ entity to reflect the
addition of this entity:

```file-path
📁 Entities/Media.ts
```

```ts
import { ID, BelongsTo, Column, Entity, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { Tweet } from './Tweet'

@Options({
    table: 'media'
})
export class Media extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    path: string

    @Relation(() => Tweet, 'media')
    tweet: BelongsTo<Tweet>
}
```

```file-path
📁 Entities/Tweet.ts
```

```ts
import { ID, BelongsTo, Column, CreatedAt, Entity, HasMany, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { User } from './User'
import { Like } from './Like'
import { Media } from './Media'

@Options({
    table: 'tweets'
})
export class Tweet extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    content: string

    @Relation(() => Media, 'tweet')
    media: HasMany<Media>

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

#### Uploading images/videos into storage

Before adding any upload functionality in the _TweetsController_, we need to change the _TweetForm_ to accept media
files:

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
    media: File | File[] = []

    @Field()
    replyParent?: number

    @Field()
    retweetParent?: number
}
```

Now that the form accepts media files, we can update the _TweetsController.create_ method to upload them:

```file-path
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { TweetForm } from 'App/Forms/TweetForm'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { User } from 'App/Entities/User'
import { Like } from 'App/Entities/Like'
import { File } from '@Typetron/Storage'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Inject } from '@Typetron/Container'
import { Storage } from '@Typetron/Storage'
import { Media } from 'App/Entities/Media'
import { EntityObject } from '@Typetron/Database'

@Controller('tweets')
@Middleware(AuthMiddleware)
export class TweetsController {

    @AuthUser()
    user: User

    @Inject()
    storage: Storage

    @Post()
    tweet(form: TweetForm) {
        return TweetModel.from(this.createTweet(form))
    }

    @Post(':Tweet/reply')
    reply(parent: Tweet, form: TweetForm) {
        return TweetModel.from(this.createTweet(form, {replyParent: parent}))
    }

    @Post(':Tweet/retweet')
    retweet(parent: Tweet, form: TweetForm) {
        return TweetModel.from(this.createTweet(form, {retweetParent: parent}))
    }

    private async createTweet(form: TweetForm, additional: Partial<EntityObject<Tweet>> = {}) {
        const tweet = await Tweet.create({
            content: form.content,
            user: this.user,
            ...additional
        })

        if (form.media instanceof File) {
            form.media = [form.media]
        }

        const mediaFiles = await Promise.all(
            form.media.map(file => this.storage.save(file, 'public/tweets-media'))
        )
        await tweet.media.save(...mediaFiles.map(media => new Media({path: media})))

        return tweet
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

This needs a bit of an explanation. The _Promise.all_ is effectively the uploading part. Here, all the files from
_form.media_ are asynchronously uploaded in the _public/tweet-media_ directory. After all of them are uploaded, the
_storage.save_ method will return the name of the saved images. This name is randomly generated to preserve their
uniqueness. The next step is to save all these image names in the media of the tweet. The _HasMany_ relationship gives
us the _.save()_ method that we can use to save one or multiple entities.

Let's make a request with the _media_ property to add images to a tweet. Since we are sending files, the form's body
type should be _form-data_:

```file-path
🌐 [POST] /tweets
```

```json
{
    "content": "my tweet content",
    "media": [
        imageFile1,
        imageFile2
    ]
}
```

The last thing we need to do, is to update the endpoint that returns all the tweets to show the media of a tweet:

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
            .with(
                'user',
                'media',
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

Of course, we also need to update the _Tweet_ model and add a model for the _Media_ entity:

```file-path
📁 Models/Media.ts
```

```ts
import { Field, Model } from '@Typetron/Models'

export class Media extends Model {
    @Field()
    path: string
}
```

```file-path
📁 Models/Tweet.ts
```

```ts
import { Field, FieldMany, Model } from '@Typetron/Models'
import { User } from './User'
import { Media } from './Media'
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

    @FieldMany(Media)
    media: Media[] = []

    @Field()
    createdAt: Date
}
```

#### Seeing images in the browser

In order to see images, we need to activate the static assets feature in our app. We can do this from the
_config/app.ts_ file:

```file-path
📁 config/app.ts
```

```ts
/* tslint:disable:no-default-export */
import { AppConfig, DatabaseProvider } from '@Typetron/Framework'
import { RoutingProvider } from 'App/Providers/RoutingProvider'
import { AppProvider } from 'App/Providers/AppProvider'

export default new AppConfig({
    port: 8000,
    environment: 'development',
    middleware: [],
    providers: [
        AppProvider,
        RoutingProvider,
        DatabaseProvider
    ],
    staticAssets: {
        '': ['public'] // <-- this
    }
})
```

Now, we can open the image using this url: _localhost:8000/tweets-media/the-weird-image-name_, eg: _localhost:
8000/tweets-media/upload_73830303b8e292.jpg_.

<div class="tutorial-next-page">
    In the next part we will add the ability to update the user profile

    <a href="profile">
        <h3>Next ></h3>
        User profile
    </a>

</div>

