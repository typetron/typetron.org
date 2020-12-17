---
layout: twitter-clone

title: Notifications
---

## {{page.title}}

Notifications are a simple way of telling the user what happened on the platform in regard to a user's profile and tweets.
We will have a few types of notifications:
- "a user follower user" notification
- "a user likes your tweet" notification
- "a user replied to your tweet" notification
- "a user retweeted your tweet" notification

This means we will have a _type_ property in our database table that will hold the information about notifications.

#### Creating the Notification entity
Because we need to save information in our database, we need to create an entity to help us:

```file-path
📁 Entities/Notification.ts
```

```ts
import {
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    Entity,
    Options,
    PrimaryColumn,
    Relation,
    UpdatedAt
} from '@Typetron/Database'
import { User } from 'App/Entities/User'
import { Tweet } from 'App/Entities/Tweet'

@Options({
    table: 'notifications'
})
export class Notification extends Entity {
    @PrimaryColumn()
    id: number

    @Column()
    type: 'follow' | 'like' | 'reply' | 'retweet'

    @Relation(() => User, 'notifications')
    user: BelongsTo<User>

    @Relation(() => User, 'activity')
    notifiers: BelongsToMany<User>

    @Relation(() => Tweet, 'notifications')
    tweet: BelongsTo<Tweet>

    @Column()
    readAt: Date

    @CreatedAt()
    createdAt: Date

    @UpdatedAt()
    updatedAt: Date
}
```

As said before, we have the _type_ property that we can use to identify what kind of notification was sent. The _user_
property is the user that will receive the notification. The _notifiers_ property is the list of users that followed the
_user_ or liked or retweeted a _user_'s tweet. The _tweet_ property is used to know on which tweet the user liked, replied
or retweeted. The _readAt_ property is user to check if the _user_ read the notification or not. 

You are probably wondering why we have a list of notifiers and not only one notifier. We could do so, but remember that
a tweet can have one or more likes, which means a tweet can interact with multiple notifiers/users before the owner sees
the tweet. 

Let's have a real world use case to better understand this:
- Joe creates a tweet
- Mike likes the tweet. At this point we create a "like" notification in the database
- Alex likes the same tweet. At this point, since we already have a like notification on this tweet from Mike, we only
need to add a notifier to it. In this case we add Alex
- Joe opens the notifications page. In this case we set the _readAt_ property with the current read date.

Having this system we automatically grouped the notifications based on the interactions of the users, just like on Twitter.

Let's update the _User_ and _Tweet_ entities to reflect the added entity above:

```file-path
📁 Entities/User.ts
```

```ts
import { BelongsToMany, BelongsToManyOptions, Column, HasMany, Options, Relation } from '@Typetron/Database'
import { User as Authenticable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'
import { Notification } from 'App/Entities/Notification'

@Options({
    table: 'users'
})
export class User extends Authenticable {
    @Column()
    name: string

    @Column()
    username: string

    @Column()
    bio: string

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
import { BelongsTo, Column, CreatedAt, Entity, HasMany, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { User } from './User'
import { Like } from './Like'
import { Media } from './Media'
import { Notification } from 'App/Entities/Notification'

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

    @CreatedAt()
    createdAt: Date
}
```


#### Adding the "follow" notification
We need to update the _follow_ method of the _UserController_ to create a notification when a user follows another user:


```file-path
📁 Controllers/UserController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Notification } from 'App/Entities/Notification'

@Controller('user')
@Middleware(AuthMiddleware)
export class UserController {

    @AuthUser()
    user: User

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

        return this.user
    }
}
```


#### Adding the "like" notification
We need to update the _like_ method of the _TweetController_ to create a notification when a user likes a tweet:

```file-path
📁 Controllers/TweetController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Like } from 'App/Entities/Like'
import { Notification } from 'App/Entities/Notification'

@Controller('tweet')
@Middleware(AuthMiddleware)
export class TweetController {

    @AuthUser()
    user: User

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

        return tweet
    }
}
```


#### Adding the "reply" and "retweet" notification

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
import { Inject } from '@Typetron/Container'
import { Storage } from '@Typetron/Storage'
import { Media } from 'App/Entities/Media'
import { Notification } from 'App/Entities/Notification'

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

        /**
         * When the retweetParent property is sent, it means the user retweeted this tweet.
         * In this case, we need to create a 'retweet' notification if the user that
         * retweeted the tweet is not its author.
         */
        if (form.retweetParent) {
            const retweetParent = await Tweet.find(form.retweetParent)
            const retweetUser = retweetParent?.user.get()
            if (retweetUser && retweetUser.id !== this.user.id) {
                const notification = await Notification.firstOrCreate({
                    type: 'retweet',
                    user: retweetUser.id,
                    readAt: undefined,
                    tweet
                })
                await notification.notifiers.attach(this.user.id)
            }
        }

        /**
         * When the replyParent property is sent, it means the user replied to this tweet.
         * In this case, we need to create a 'reply' notification if the user that
         * retweeted the tweet is not its author.
         */
        if (form.replyParent) {
            const replyParent = await Tweet.find(form.replyParent)
            const replyUser = replyParent?.user.get()
            if (replyUser && replyUser.id !== this.user.id) {
                const notification = await Notification.firstOrCreate({
                    type: 'reply',
                    user: replyUser.id,
                    readAt: undefined,
                    tweet
                })
                await notification.notifiers.attach(this.user.id)
            }
        }

        await tweet.load('user')
        return tweet
    }

}
```

This looks a bit complex, but it's actually a lot of duplicated code that we can rewrite as: 


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
import { Inject } from '@Typetron/Container'
import { Storage } from '@Typetron/Storage'
import { Media } from 'App/Entities/Media'
import { Notification } from 'App/Entities/Notification'

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
        return tweet
    }

    private async addNotification(tweet: Tweet, parent: number, type: 'reply' | 'retweet') {
        const parentTweet = await Tweet.find(parent)
        const parentTweetUser = parentTweet?.user.get()
        /**
         * we need to create a 'reply' notification if the user that replied the tweet is not its author.
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
}
```

<div class="tutorial-next-page">
    In the next part we will add the ability to change the topics of the user

    <a href="tweets">
        <h3>Next ></h3>
        Topics
    </a>

</div>
