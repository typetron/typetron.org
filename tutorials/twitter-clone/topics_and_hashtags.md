---
layout: twitter-clone

title: Topics and hashtags
---

## {{page.title}}

Topics are used to identify the most relevant tweets to show to the logged-in user. Each topic will contain a list of
hashtags. A user can use these hashtags in his tweets. For example, we might have the "Web development" topics that will
contain the following hashtags: "web", "html", "CSS", "javascript", "typescript" etc.

#### Creating the Topic and Hashtag entities

```file-path
📁 Entities/Topic.ts
```

```ts
import { BelongsToMany, Column, Entity, HasMany, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { User } from 'App/Entities/User'
import { Hashtag } from 'App/Entities/Hashtag'

@Options({
    table: 'topics'
})
export class Topic extends Entity {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @Relation(() => User, 'topics')
    enthusiasts: BelongsToMany<User> // `followers` can be used as well but it will be confused with user.followers

    @Relation(() => Hashtag, 'topic')
    hashtags: HasMany<Hashtag>
}
```

```file-path
📁 Entities/Hastag.ts
```

```ts
import { BelongsTo, BelongsToMany, Column, Entity, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { Topic } from 'App/Entities/Topic'
import { Tweet } from 'App/Entities/Tweet'

@Options({
    table: 'hashtags'
})
export class Hashtag extends Entity {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @Relation(() => Topic, 'hashtags')
    topic: BelongsTo<Topic>

    @Relation(() => Tweet, 'hashtags')
    tweets: BelongsToMany<Tweet>
}
```

#### Adding/removing topics for the user

Let's add an endpoint that a user can use to add or remove topics based on their personal preferences:

```file-path
📁 Forms/TopicsForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'

export class TopicsForm extends Form {
    @Field()
    @Rules(Required)
    topics: number[] = []
}
```

Now, we can update _UserController_ to return all the topics of a user and also save them if necessary after we create
the _Topics_ model:

```file-path
📁 Models/Topics.ts
```

```ts
import { Field, Model } from '@Typetron/Models'

export class Topic extends Model {
    @Field()
    id: number

    @Field()
    name: string
}
```

```file-path
📁 Controllers/Http/UserController.ts
```

```ts
import { Controller, Get, Middleware, Post } from '@Typetron/Router'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { Topic as TopicModel } from 'App/Models/Topics'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { TopicsForm } from 'App/Forms/TopicsForm'

@Controller('user')
@Middleware(AuthMiddleware)
export class UserController {

    @AuthUser()
    user: User

    @Get('topics')
    async getTopics() {
        return TopicModel.from(this.user.topics.get())
    }

    @Post('topics')
    async setTopics(form: TopicsForm) {
        await this.user.topics.sync(...form.topics)
    }
}
```

#### Adding hashtags to tweets

In order to link a tweet with hashtags, we need to identify the hashtags in the tweet's content using Regular
expressions
(Regexp for short). Let's modify the _TweetController_ and add this feature:

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
import { Inject } from '@Typetron/Container'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { Storage } from '@Typetron/Storage'
import { Notification } from 'App/Entities/Notification'
import { Hashtag } from 'App/Entities/Hashtag'
import { Media } from 'App/Entities/Media'

@Controller('tweet')
@Middleware(AuthMiddleware)
export class TweetController {

    @AuthUser()
    user: User

    @Inject()
    storage: Storage

    @Post()
    async create(form: TweetForm) {
        const tweet = new Tweet(form)
        await this.user.tweets.save(tweet)

        const mediaFiles = await Promise.all(
            form.media.map(file => this.storage.put(file, 'public/tweets-media'))
        )
        await tweet.media.save(...mediaFiles.map(media => new Media({path: media})))

        await this.addHashTags(tweet)

        /**
         * When the replyParent property is sent, it means the user replied this tweet.
         */
        if (form.replyParent) {
            await this.addNotification(tweet, form.replyParent, 'reply')
        }

        /**
         * When the retweetParent property is sent, it means the user retweeted this tweet.
         */
        if (form.retweetParent) {
            await this.addNotification(tweet, form.retweetParent, 'retweet')
        }

        await tweet.load('user')
        
        return TweetModel.from(tweet)
    }

    private async addNotification(tweet: Tweet, parent: number, type: 'reply' | 'retweet') {
        const parentTweet = await Tweet.find(parent)
        const parentTweetUser = parentTweet?.user.get()
        /**
         * we need to create a notification if the user that replied/retweeted with this tweet is not its author.
         */
        if (parentTweetUser && parentTweetUser.id !== this.user.id) {
            const notification = await Notification.firstOrCreate({
                type: type,
                user: parentTweetUser.id,
                readAt: undefined,
                tweet
            })
            await notification.notifiers.attach(this.user.id)
        }
    }

    private async addHashTags(tweet: Tweet) {
        const hashtagsList = tweet.content.matchAll(/\B#(\w\w+)\b/gm)
        const hashtagsNames = Array.from(hashtagsList).map(hashtag => hashtag[1])
        const hashtags = await Hashtag.whereIn('name', hashtagsNames).get()

        await tweet.hashtags.sync(...hashtags.pluck('id'))
    }
}
```

#### Showing relevant tweets to users

Now, that we've added the ability to set topics for users and hashtags for tweets, we can create a new endpoint that
will return the latest tweets based on that:

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
import { Hashtag } from 'App/Entities/Hashtag'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @AuthUser()
    user: User

    @Get('explore')
    async explore(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const userHashtags = await Hashtag.whereIn('topic', this.user.topics.items.pluck('id')).get()
        const tweets = await Tweet
            .with(
                'user',
                'media',
                'replyParent.user',
                'retweetParent.user',
                ['likes', query => query.where('userId', this.user.id)]
            )
            .whereIn(
                'id',
                query => query.table('hashtags_tweets').select('tweetId').whereIn('hashTagId', userHashtags.pluck('id'))
            )
            .withCount('likes', 'replies', 'retweets')
            .orderBy('createdAt', 'DESC')
            .limit((page - 1) * limit, limit)
            .get()
        
        return TweetModel.from(tweets)

    }
}
```

This might look complex, but what is does is just selecting all the tweets from the platform that contain all the
hashtags from the user's topics. There is also room for query optimization here but let's only optimize the code by
extracting the duplicated code in a method:

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
import { Hashtag } from 'App/Entities/Hashtag'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @AuthUser()
    user: User

    @Get()
    async tweets(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const followings = await this.user.following.get()
        const tweets = await this.getTweetsQuery(page, limit)
            .whereIn('userId', followings.pluck('id').concat(this.user.id))
            .get()
        
        return TweetModel.from(tweets)
    }

    @Get('explore')
    async explore(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        await this.user.load('topics')
        const userHashtags = await Hashtag.whereIn('topic', this.user.topics.items.pluck('id')).get()
        const tweets = await this.getTweetsQuery(page, limit)
            .whereIn(
                'id',
                query => query.table('hashtags_tweets').select('tweetId').whereIn('hashTagId', userHashtags.pluck('id'))
            )
            .get()
        
        return TweetModel.from(tweets)
    }

    getTweetsQuery(page: number, limit: number) {
        return Tweet
            .with(
                'user',
                'media',
                'replyParent.user',
                'retweetParent.user',
                ['likes', query => query.where('userId', this.user.id)]
            )
            .withCount('likes', 'replies', 'retweets')
            .orderBy('createdAt', 'DESC')
            .limit((page - 1) * limit, limit)
    }
}
```

Since we are here, lets also add an endpoint that will return all the tweets of a user based on a given username. We can
use this to show all the tweets of a user when going to its profile:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware, Query } from '@Typetron/Router'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { User } from 'App/Entities/User'
import { Tweet as TweetModel } from 'App/Models/Tweet'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get(':username/tweets')
    async userTweets(username: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const user = await User.where('username', username).first()

        if (!user) {
            throw new Error('User not found')
        }

        return TweetModel.from(this.getTweetsQuery(page, limit).where('userId', user.id).get())
    }
}
```

<div class="tutorial-next-page">
    In the next part we will follow and unfollow users

    <a href="mentions">
        <h3>Next ></h3>
        Mentions
    </a>

</div>

