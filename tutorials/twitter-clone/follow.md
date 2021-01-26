---
layout: twitter-clone

title: Follow/Unfollow users
---

## {{page.title}}

This is one of the most complex features of the app because it will make use of self-referencing relationships using
pivot tables. Let's update the _Users_ entity to add this feature:

```file-path
📁 Entities/User.ts
```

```ts
import { BelongsToMany, BelongsToManyOptions, Column, HasMany, Options, Relation } from '@Typetron/Database'
import { User as Authenticatable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'

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

The _followers_ property will contain the users that follow a specific user, and the _following_ property will contain
the users a specific user is following. This might be confusing but let's explain this with an example.

Let's say we have three users: Joe, Mike and Alex where

- Joe is following Mike and Alex
- Mike is following Joe.
- Alex is following Mike

In this scenario we will have:

- Joe with one follower: Mike, and two followings: Mike and Alex
- Mike with two followers: Joe and Alex, and one following: Joe
- Alex with one follower: Joe, and one following: Mike

#### Following and unfollowing a user

Having these relationships in place we can now easily add the follow feature in our _UsersController_:

```file-path
📁 Controllers/Http/UsersController.ts
```

```ts
import { Controller, Middleware, Post, Put } from '@Typetron/Router'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { UserForm } from 'App/Forms/UserForm'
import { User as UserModel } from 'App/Models/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Storage } from '@Typetron/Storage'
import { Inject } from '@Typetron/Container'

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

    @Post(':User/follow')
    async follow(userToFollow: User) {
        await this.user.following.add(userToFollow.id)
    }

    @Post(':User/unfollow')
    async unfollow(userToUnfollow: User) {
        await this.user.following.remove(userToUnfollow.id)
    }
}
```

As easy as that, we now can follow and unfollow users. Let's make a few requests to test that. Don't forget to add
another user in the app using the register endpoint. In my case, the next added user had the ID 2, so I will use that
in my _follow_ request:

```file-path
🌐 [POST] /users/2/follow
```

Let's also add some endpoints to get the followers and following of a user but this time, searching the user based on
its username. This will become in handy when we want to get information about a user when we only have its handle,
like _@ionel_ or *@typetron\_* :

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
    }

    @Post(':User/unfollow')
    async unfollow(userToUnfollow: User) {
        await this.user.following.remove(userToUnfollow.id)
    }
}
```

Making a request to _`[GET] /users/joe/followers`_ should return one user that is following _joe_.

#### Showing tweets from followed users

Now that we have the followers feature added, we can modify the endpoint that returns the latest tweets, to return the
latest tweets from the users I am following. Let's also add pagination:

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
    async tweets(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const followings = await this.user.following.get()
        const tweets = await Tweet
            .with(
                'user',
                'media',
                'replyParent.user',
                'retweetParent.user',
                ['likes', query => query.where('userId', this.user.id)]
            )
            .whereIn('userId', followings.pluck('id').concat(this.user.id))
            .withCount('likes', 'replies', 'retweets')
            .orderBy('createdAt', 'DESC')
            .limit((page - 1) * limit, limit)
            .get()

        return TweetModel.from(tweets)
    }
}
```

<div class="tutorial-next-page">
    In the next part we will send notifications to users

    <a href="notifications">
        <h3>Next ></h3>
        Sending notifications
    </a>

</div>

