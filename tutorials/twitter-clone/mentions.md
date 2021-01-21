---
layout: twitter-clone

title: User mentions
---

## {{page.title}}

User mentions are a way of letting one or more users that you mentioned them in a tweet. These users will receive a
"mention" notification letting them know there were mentioned in your tweet.

#### Updating the Notification entity

Since we have a new type of notification, we need to update the type property of the _Notification_ entity and also its
model:

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
    type: 'follow' | 'like' | 'reply' | 'retweet' | 'mention'

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

```file-path
📁 Models/Notification.ts
```

```ts
import { Field, Model } from '@Typetron/Models'
import { User } from './User'
import { Tweet } from './Tweet'

export class Notification extends Model {
    @Field()
    id: number

    @Field()
    type: 'follow' | 'like' | 'reply' | 'retweet' | 'mention'

    @Field()
    notifiers: User[] = []

    @Field()
    tweet: Tweet
}
```

#### Adding the mention feature

This is a really easy one because it doesn't involve any new entities. All we need to do is to update the endpoint that
created a new tweet to send mention notifications:

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
import { Hashtag } from 'App/Entities/Hashtag'

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

        await this.addTweetNotification(tweet, parent, 'reply')

        return TweetModel.from(tweet)
    }

    @Post(':Tweet/retweet')
    async retweet(parent: Tweet, form: TweetForm) {
        const tweet = await this.createTweet(form, {retweetParent: parent})

        await this.addTweetNotification(tweet, parent, 'reply')

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

        await this.addHashTags(tweet)
        await this.sendMentionNotifications(tweet)

        return tweet
    }

    private async addTweetNotification(tweet: Tweet, parentTweet: Tweet, type: 'reply' | 'retweet') {
        const parentTweetUser = parentTweet.user.get()
        /**
         * We need to create a notification if the user that replied/retweeted with this tweet is not its author.
         */
        if (parentTweetUser && parentTweetUser?.id !== this.user.id) {
            await this.addNotification(tweet, parentTweetUser.id, type)
        }
    }

    private async addNotification(tweet: Tweet, userId: number, type: Notification['type']) {
        const notification = await Notification.create({
            user: userId,
            type,
            tweet
        })
        await notification.notifiers.add(this.user.id)
    }

    private async addHashTags(tweet: Tweet) {
        const hashtagsList = tweet.content.matchAll(/\B#(\w\w+)\b/gm)
        const hashtagsNames = Array.from(hashtagsList).map(hashtag => hashtag[1])
        const hashtags = await Hashtag.whereIn('name', hashtagsNames).get()

        await tweet.hashtags.sync(...hashtags.pluck('id'))
    }

    private async sendMentionNotifications(tweet: Tweet) {
        const mentionsList = tweet.content.matchAll(/\B@(\w\w+)\b/gm)
        const usernames = Array.from(mentionsList).map(mention => mention[1])
        const users = await User.whereIn('username', usernames).get()
        for (const user of users) {
            await this.addNotification(tweet, user.id, 'mention')
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

This is the entire tweet creation functionality from our Twitter clone app. To send user mention notifications we just
search the usernames in the tweet's content and insert a specific notification in the database.

Let's make a request to test this feature:

```file-path
🌐 [POST] /
```

```json
{
    "content": "How are you doing @joe"
}
```

Now, a user named _joe_ should get a 'mention' notification.

<div class="tutorial-next-page">
    In the next part we will start creating the frontend part of the app

    <a href="frontend">
        <h3>Next ></h3>
        Frontend
    </a>

</div>

