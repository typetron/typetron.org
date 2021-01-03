---
layout: twitter-clone

title: Topics and hashtags
---

## {{page.title}}

Topics are used to identify the most relevant tweets to show to the logged-in user. Each topic will contain a list of
hashtags. A user can use these hashtags in his tweets. For example, we might have the "Web development" topic that will
contain the following hashtags: "web", "html", "CSS", "javascript", "typescript" etc. These hashtags will be identified
with the 'pound' symbol in front of them. For example, this might be the content of a tweet: "Hello #webdevelopers"

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
📁 Entities/Hashtag.ts
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

Let's not forget to update the relationships on the _User_ and _Tweet_ entities:

```file-path
📁 Entities/User.ts
```

```ts
import { BelongsToMany, BelongsToManyOptions, Column, HasMany, Options, Relation } from '@Typetron/Database'
import { User as Authenticable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'
import { Notification } from 'App/Entities/Notification'
import { Topic } from 'App/Entities/Topic'

@Options({
    table: 'users'
})
export class User extends Authenticable {
    @Column()
    name: string

    @Column()
    username: string

    @Column()
    bio?: string

    @Column()
    photo: string

    @Column()
    cover: string

    @Relation(() => Like, 'user')
    likes: HasMany<Like>

    @Relation(() => Tweet, 'user')
    tweets: HasMany<Tweet>

    @Relation(() => Notification, 'user')
    notifications: HasMany<Notification>

    @Relation(() => Notification, 'notifiers')
    activity: BelongsToMany<Notification>

    @Relation(() => Topic, 'enthusiasts')
    topics: BelongsToMany<Topic>

    @Relation(() => User, 'following')
    @BelongsToManyOptions({
        table: 'followers',
        column: 'followerId',
        foreignColumn: 'followingId'
    })
    followers: BelongsToMany<User>

    @Relation(() => User, 'followers')
    @BelongsToManyOptions({
        table: 'followers',
        column: 'followingId',
        foreignColumn: 'followerId'
    })
    following: BelongsToMany<User>
}
```

```file-path
📁 Entities/Tweet.ts
```

```ts
import {
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    Entity,
    HasMany,
    Options,
    PrimaryColumn,
    Relation
} from '@Typetron/Database'
import { User } from './User'
import { Like } from './Like'
import { Media } from './Media'
import { Notification } from 'App/Entities/Notification'
import { Hashtag } from 'App/Entities/Hashtag'

@Options({
    table: 'tweets'
})
export class Tweet extends Entity {
    @PrimaryColumn()
    id: number

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

    @Relation(() => Notification, 'tweet')
    notifications: HasMany<Notification>

    @Relation(() => Hashtag, 'tweets')
    hashtags: BelongsToMany<Hashtag>

    @CreatedAt()
    createdAt: Date
}
```

#### Adding/removing topics for the user

Let's add an endpoint that a user can use to add or remove topics based on their personal preferences:

```file-path
📁 Forms/UserTopicsForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Required } from '@Typetron/Validation'

export class UserTopicsForm extends Form {
    @Field()
    @Rules(Required)
    topics: number[] = []
}
```

Now, we can update _UsersController_ to return all the topics of a user and also save them if necessary after we create
the _Topics_ model:

```file-path
📁 Models/Topic.ts
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
📁 Controllers/Http/UsersController.ts
```

```ts
import { Controller, Get, Middleware, Post } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Storage } from '@Typetron/Storage'
import { Notification } from 'App/Entities/Notification'
import { Topic as TopicModel } from 'App/Models/Topics'
import { UserTopicsForm } from 'App/Forms/UserTopicsForm'

@Controller('users')
@Middleware(AuthMiddleware)
export class UsersController {

    @AuthUser()
    user: User

    @Inject()
    storage: Storage

    @Patch()
    async update(form: UserForm) {
        if (form.photo) {
            await this.storage.delete(`public/${this.user.photo}`)
            form.photo = await this.storage.save(form.photo, 'public')
        }
        if (form.cover) {
            await this.storage.delete(`public/${this.user.cover}`)
            form.cover = await this.storage.save(form.cover, 'public')
        }
        await this.user.save(form)

        return UserModel.from(this.user)
    }

    @Get(':username/followers')
    async followers(username: string) {
        const user = await User.where('username', username).first()

        if (!user) {
            throw new Error('User not found')
        }

        return UserModel.from(user.followers.get())
    }

    @Get(':username/following')
    async following(username: string) {
        const user = await User.where('username', username).first()

        if (!user) {
            throw new Error('User not found')
        }

        return UserModel.from(user.following.get())
    }

    @Post('follow/:User')
    async follow(userToFollow: User) {
        await this.user.following.attach(userToFollow.id)

        const notification = await Notification.firstOrCreate({
            type: 'follow',
            user: userToFollow,
            readAt: undefined
        })

        if (!await notification.notifiers.has(this.user.id)) {
            await notification.notifiers.attach(this.user.id)
        }

        return UserModel.from(this.user)
    }

    @Post('unfollow/:User')
    async unfollow(userToUnfollow: User) {
        await this.user.following.detach(userToUnfollow.id)
    }

    @Get('topics')
    async getTopics() {
        return TopicModel.from(this.user.topics.get())
    }

    @Post('topics')
    async setTopics(form: UserTopicsForm) {
        await this.user.topics.sync(...form.topics)
    }
}
```

Before making a request to set a user's topics, we need a few topics added in our database. Since we don't have an admin
dashboard we can use to add these topics (which will be the 3rd tutorial), we have to do it manually through the SQL
client we are using. So, go ahead and add a few topics like "Music", "Health", "Programming" etc. Let's create a
_TopicsController_ together with a _Topic_ model, so we can get a list of all the available topics on our social
platform:

```file-path
📁 Controllers/Http/TopicsController.ts
```

```ts
import { Controller, Get } from '@Typetron/Router'
import { Topic as TopicModel } from 'App/Models/Topic'
import { Topic } from 'App/Entities/Topic'

@Controller('topics')
export class TopicsController {

    @Get()
    async get() {
        return TopicModel.from(Topic.get())
    }

}
```

```file-path
📁 Models/Topic.ts
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

Let's make a request to update a user's topics where the value for the _topics_ property is an array of topics ids:

```file-path
🌐 [POST] /users/topics
```

```json
{
    "topics": [
        1,
        2,
        3
    ]
}
```

#### Adding hashtags to tweets

In order to link a tweet with hashtags, we need to identify the hashtags in the tweet's content using Regular
expressions
(Regexp for short). Let's modify the _TweetsController_ and add this feature:

```file-path
📁 Controllers/Http/TweetsController.ts
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
import { Like } from 'App/Entities/Like'

@Controller('tweets')
@Middleware(AuthMiddleware)
export class TweetsController {

    @AuthUser()
    user: User

    @Inject()
    storage: Storage

    @Post()
    async create(form: TweetForm) {
        const tweet = new Tweet(form)
        await this.user.tweets.save(tweet)

        if (form.media instanceof File) {
            form.media = [form.media]
        }

        const mediaFiles = await Promise.all(
            form.media.map(file => this.storage.save(file, 'public/tweets-media'))
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

    @Post(':Tweet/like')
    async like(tweet: Tweet) {
        let notification: Notification | undefined
        /**
         * Check to see if the tweet's user is not its author because
         * we don't want to send a notification to its author
         */
        if (tweet.user.get()?.id !== this.user.id) {
            notification = await Notification.firstOrCreate({
                type: 'like',
                user: tweet.user.get(),
                readAt: undefined,
                tweet
            })
        }

        const like = await Like.firstOrNew({tweet, user: this.user})
        if (like.exists) {
            await like.delete()
            await notification?.notifiers.detach(this.user.id)
        } else {
            await like.save()
            await notification?.notifiers.attach(this.user.id)
        }

        return TweetModel.from(tweet)
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
        await this.user.load('topics')
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

Let's make a request to test these endpoints:

```file-path
🌐 [GET] /?page=1&limit=5
```

```file-path
🌐 [GET] /explore?page=1&limit=10
```

Since we are here, lets also add an endpoint that will return all the tweets of a user based on a given username. We can
use this to show all the tweets of a user when going to its profile:

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

    @Get(':username/tweets')
    async userTweets(username: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const user = await User.where('username', username).first()

        if (!user) {
            throw new Error('User not found')
        }

        return TweetModel.from(this.getTweetsQuery(page, limit).where('userId', user.id).get())
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

Let's also make here a request to test this endpoint:

```file-path
🌐 [GET] /joe/tweets
```

<div class="tutorial-next-page">
    In the next part we will follow and unfollow users

    <a href="mentions">
        <h3>Next ></h3>
        Mentions
    </a>

</div>

