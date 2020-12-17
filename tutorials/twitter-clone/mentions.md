---
layout: twitter-clone

title: User mentions
---

## {{page.title}}

User mentions are a way of letting one or more users that you mentioned them in a tweet. These users will receive a 
"mention" notification letting them know there were mentioned in your tweet.

#### Adding the mention feature

This is a really easy one because it doesn't involve any new entities. All we need to do is to update the endpoint that
created a new tweet to send mention notifications:

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
import { Tweet as TweetModel } from '@Data/Models/Tweet'
import { Inject } from '@Typetron/Container'
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
        await this.sendMentionNotifications(tweet)

        /**
         * When the replyParent property is sent, it means the user replied this tweet.
         */
        if (form.replyParent) {
            await this.addTweetNotification(tweet, form.replyParent, 'reply')
        }

        /**
         * When the retweetParent property is sent, it means the user retweeted this tweet.
         */
        if (form.retweetParent) {
            await this.addTweetNotification(tweet, form.retweetParent, 'retweet')
        }

        await tweet.load('user')
        return TweetModel.from(tweet)
    }

    private async addTweetNotification(tweet: Tweet, parent: number, type: 'reply' | 'retweet') {
        const parentTweet = await Tweet.find(parent)
        const parentTweetUser = parentTweet?.user.get()
        /**
         * we need to create a 'reply' notification if the user that replied the tweet is not its author.
         */
        if (parentTweetUser && parentTweetUser.id !== this.user.id) {
            await this.addNotification(tweet, parentTweetUser.id, type)
        }
    }

    private async addNotification(tweet: Tweet, userId: number, type: Notification['type']) {
        const notification = await Notification.create({
            type: 'mention',
            user: userId,
            tweet
        })
        await notification.notifiers.attach(this.user.id)
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
}
```

This is the entire tweet creation functionality from our Twitter clone app. To send user mention notifications we just
search the usernames in the tweet's content and insert a specific notification in the database.

<div class="tutorial-next-page">
    In the next part we will start creating the frontend part of the app

    <a href="tweets">
        <h3>Next ></h3>
        Frontend
    </a>

</div>

