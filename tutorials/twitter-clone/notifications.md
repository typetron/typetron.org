---
layout: twitter-clone

title: Notifications
---

## {{page.title}}

Notifications are a simple way of telling the user what happened on the platform regarding a user's profile and tweets.
We will have a few types of notifications:

- "a user followed you" notification
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
    ID,
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
    id: ID

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
_user_ or liked or retweeted a _user_'s tweet. The _tweet_ property is used to know on which tweet the user liked,
replied or retweeted. The _readAt_ property is user to check if the _user_ read the notification or not.

You are probably wondering why we have a list of notifiers and not only one notifier. We could do so, but remember that
a tweet can have one or more likes, which means a tweet can interact with multiple notifiers/users before the owner sees
the tweet.

Let's have a real world use case to better understand this:

- Joe creates a tweet
- Mike likes the tweet. At this point we create a "like" notification in the database
- Alex likes the same tweet. At this point, since we already have a like notification on this tweet from Mike, we only
  need to add a notifier to it. In this case we add Alex
- Joe opens the notifications page. In this case we set the _readAt_ property with the current read date.

Having this system we automatically group the notifications based on the interactions of the users, just like on
Twitter.

Let's update the _User_ and _Tweet_ entities to reflect the added entity above:

```file-path
📁 Entities/User.ts
```

```ts
import { BelongsToMany, BelongsToManyOptions, Column, HasMany, Options, Relation } from '@Typetron/Database'
import { User as Authenticatable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'
import { Notification } from 'App/Entities/Notification'

@Options({
    table: 'users'
})
export class User extends Authenticatable {
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
import { ID, BelongsTo, Column, CreatedAt, Entity, HasMany, Options, PrimaryColumn, Relation } from '@Typetron/Database'
import { User } from './User'
import { Like } from './Like'
import { Media } from './Media'
import { Notification } from 'App/Entities/Notification'

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

    @Relation(() => Notification, 'tweet')
    notifications: HasMany<Notification>

    @CreatedAt()
    createdAt: Date
}
```

#### Adding the "follow" notification

We need to update the _follow_ method of the _UsersController_ to create a notification when a user follows another
user:

```file-path
📁 Controllers/Http/UsersController.ts
```

```ts
import { Controller, Get, Middleware, Post, Put } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { UserForm } from 'App/Forms/UserForm'
import { User as UserModel } from 'App/Models/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Storage } from '@Typetron/Storage'
import { Notification } from 'App/Entities/Notification'

@Controller('users')
@Middleware(AuthMiddleware)
export class UsersController {

    @AuthUser()
    user: User

    @Inject()
    storage: Storage

    @Put()
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

    @Post(':User/follow')
    async follow(userToFollow: User) {
        await this.user.following.add(userToFollow.id)

        const notification = await Notification.firstOrCreate({
            type: 'follow',
            user: userToFollow,
            readAt: undefined
        })

        if (!await notification.notifiers.has(this.user.id)) {
            await notification.notifiers.add(this.user.id)
        }

        return UserModel.from(this.user)
    }

    @Post(':User/unfollow')
    async unfollow(userToUnfollow: User) {
        await this.user.following.remove(userToUnfollow.id)
    }
}
```

#### Adding the "like" notification

We need to update the _like_ method of the _TweetsController_ to create a notification when a user likes a tweet:

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
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Inject } from '@Typetron/Container'
import { Storage, File } from '@Typetron/Storage'
import { Media } from 'App/Entities/Media'
import { Notification } from 'App/Entities/Notification'
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
            await notification?.notifiers.remove(this.user.id)
        } else {
            await like.save()
            await notification?.notifiers.add(this.user.id)
        }

        return TweetModel.from(tweet)
    }
}
```

Making a request to follow a user should create a notification entry in the database. Later we will add a controller to
get those notifications.

#### Adding the "reply" and "retweet" notification

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
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Inject } from '@Typetron/Container'
import { Storage, File } from '@Typetron/Storage'
import { Media } from 'App/Entities/Media'
import { Notification } from 'App/Entities/Notification'
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
    async reply(parent: Tweet, form: TweetForm) {
        const tweet = await this.createTweet(form, {replyParent: parent})

        /**
         * In this case, we need to create a 'reply' notification
         * if the user that replied the tweet is not its author.
         */
        const parentTweetUser = parent.user.get()
        if (parentTweetUser && parentTweetUser.id !== this.user.id) {
            const notification = await Notification.firstOrCreate({
                type: 'reply',
                user: parentTweetUser,
                readAt: undefined,
                tweet
            })
            await notification.notifiers.add(this.user.id)
        }

        return TweetModel.from(tweet)
    }

    @Post(':Tweet/retweet')
    async retweet(parent: Tweet, form: TweetForm) {
        const tweet = await this.createTweet(form, {retweetParent: parent})

        /**
         * In this case, we need to create a 'retweet' notification
         * if the user that retweeted the tweet is not its author.
         */
        const parentTweetUser = parent.user.get()
        if (parentTweetUser && parentTweetUser.id !== this.user.id) {
            const notification = await Notification.firstOrCreate({
                type: 'retweet',
                user: parentTweetUser,
                readAt: undefined,
                tweet
            })
            await notification.notifiers.add(this.user.id)
        }

        return TweetModel.from(tweet)
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
            await notification?.notifiers.remove(this.user.id)
        } else {
            await like.save()
            await notification?.notifiers.add(this.user.id)
        }

        return TweetModel.from(tweet)
    }
}
```

This looks a bit complex, but it's actually a lot of duplicated code that we can rewrite as:

```file-path
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { TweetForm } from 'App/Forms/TweetForm'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Inject } from '@Typetron/Container'
import { Storage, File } from '@Typetron/Storage'
import { Media } from 'App/Entities/Media'
import { Notification } from 'App/Entities/Notification'
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
    async reply(parent: Tweet, form: TweetForm) {
        const tweet = await this.createTweet(form, {replyParent: parent})

        await this.addNotification(tweet, parent, 'reply')

        return TweetModel.from(tweet)
    }

    @Post(':Tweet/retweet')
    async retweet(parent: Tweet, form: TweetForm) {
        const tweet = await this.createTweet(form, {retweetParent: parent})

        await this.addNotification(tweet, parent, 'reply')

        return TweetModel.from(tweet)
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

    private async addNotification(tweet: Tweet, parentTweet: Tweet, type: 'reply' | 'retweet') {
        const parentTweetUser = parentTweet.user.get()
        /**
         * We need to create a notification if the user that replied/retweeted with this tweet is not its author.
         */
        if (parentTweetUser && parentTweetUser.id !== this.user.id) {
            const notification = await Notification.firstOrCreate({
                user: parentTweetUser,
                readAt: undefined,
                type,
                tweet
            })
            await notification.notifiers.add(this.user.id)
        }
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
            await notification?.notifiers.remove(this.user.id)
        } else {
            await like.save()
            await notification?.notifiers.add(this.user.id)
        }

        return TweetModel.from(tweet)
    }
}
```

#### Getting the user notifications

To get a user's notifications, we need a few endpoints:

- one that we can use to read all the notifications of the logged-in user
- one for getting the count of all unread notifications. This will be used to show a notifications badge in the
  interface with the number of unread notifications
- one for marking the unread notifications as read

Let's not also forget to create a _Notification_ model:

```file-path
📁 Models/Notification.ts
```

```ts
import { Field, Model, FieldMany } from '@Typetron/Models'
import { User } from './User'
import { Tweet } from './Tweet'

export class Notification extends Model {
    @Field()
    id: number

    @Field()
    type: 'follow' | 'like' | 'reply' | 'retweet'

    @FieldMany(User)
    notifiers: User[] = []

    @Field()
    tweet: Tweet
}
```

```file-path
📁 Controllers/Http/NotificationsController.ts
```

```ts
import { Controller, Get, Middleware, Post } from '@Typetron/Router'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Notification as NotificationModel } from 'App/Models/Notification'
import { Notification } from 'App/Entities/Notification'

@Controller('notifications')
@Middleware(AuthMiddleware)
export class NotificationsController {

    @AuthUser()
    user: User

    @Get()
    async get() {
        const notifications = await Notification
            .with('notifiers', 'tweet')
            .where('userId', this.user.id)
            .orderBy('createdAt')
            .get()

        return NotificationModel.from(notifications)
    }

    @Get('unread')
    async unread() {
        return await Notification.where('user', this.user.id).whereNull('readAt').count()
    }

    @Post('read')
    async markAllAsRead() {
        await Notification.where('user', this.user.id).whereNull('readAt').update('readAt', new Date())
    }
}
```

Now, we can get all the notifications for our user making a request to `[GET] /notifications`. We can also get the
number of unread notifications by making a request to `[GET] /notifications/unread` and then we can mark all the unread
notifications as read by making a request to `[POST] /notifications/read`. I decided to leave these request separate, so
we have greater control.

<div class="tutorial-next-page">
    In the next part we will add the ability to change the topics of the user

    <a href="topics_and_hashtags">
        <h3>Next ></h3>
        Topics
    </a>

</div>

