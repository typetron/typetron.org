---
layout: twitter-clone

title: Showing the latest tweets
---

## {{page.title}}

Before showing anything to the user, we need to have some data to show in the first place. Let's create the Tweet
entity. This entity will store all the information about a tweet in the database, like it's _content_ for example.

#### Creating the Tweet entity

Let's think a bit about what fields this entity will have:

- a content which is the actual message of the tweet
- the owner of the tweet which is the person that created the tweet
- a date field that will show us when the tweet was posted

Go inside the _Entities_ directory and create the _Tweet.ts_ file there:

```file-path
📁 Entities/Tweet.ts
```

```ts
import {
    ID,
    Column,
    CreatedAt,
    Entity,
    Options,
    PrimaryColumn,
    Relation,
    BelongsTo
} from '@Typetron/Database'
import { User } from './User'

@Options({
    table: 'tweets'
})
export class Tweet extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    content: string

    @Relation(() => User, 'tweets')
    user: BelongsTo<User>

    @CreatedAt()
    createdAt: Date
}
```

Don't worry about the error in the entity. We will have to add the inverse of the relationship in the _User_ entity to
make it go away. The inverse relationship will tell Typetron more info about our entities.

One thing we also need to do, is to update the _User_ entity to reflect the added relationship.

```file-path
📁 Entities/User.ts
```

```ts
import { Column, Options, Relation, HasMany } from '@Typetron/Database'
import { User as Authenticable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'

@Options({
    table: 'users'
})
export class User extends Authenticable {
    @Column()
    name: string

    @Relation(() => Tweet, 'user')
    tweets: HasMany<Tweet>
}
```

This information is used by Typetron to better understand you app, and it also has some other benefits that we will see
throughout the tutorial. You can find more information about [relationships here](/docs/orm).

Saving these files will automatically create the _tweets_ table for you in the sqlite database from inside the project.
You can check this database by opening the _database.sqlite_ file with a SQLite client.

> _**Question**_: Why is the database updated automatically?
>
> _**Answer**_: By default, Typetron has the option of automatically update the database turned on.
> This option can be changed from _config/database.ts_ file. [More info here](/docs/database)

> _**Question**_: What if I want to use a MySQL server?
>
> _**Answer**_: Typetron will support MySQL drivers in the future, but because it is still in heavy development,
> we postponed the MySQL feature before the V1 release. You can find more about the [Roadmap here](https://github.com/typetron/framework)

#### Adding tweets in the database

Let's create a route that we can use to add tweets in the database. We can add this route in a new _TweetsController_
file in the _Controllers/Http_ directory:

```file-path
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Request } from '@Typetron/Web'

@Controller('tweets')
export class TweetsController {

    @Post()
    create(request: Request) {
        const data = request.body as {content: string}
        return Tweet.create({
            content: data.content,
            // user:  we need users before proceeding
        })
    }
}
```

As you probably noticed in the Tweet entity, it needs a User it belongs to. In our case, this user should the logged-in
user, but we didn't talk about this yet.

#### Registering and logging-in

Typetron has an authentication system built-in, and we can use that to register and login. You can find thin
functionality in the _Controllers/Http/AuthController.ts_ file. ([More about Authentication](/docs/authentication)).

Having this in mind, we can use the _/register_ route to register a user:

```file-path
🌐 [POST] /register
```

```json
{
    "email": "john@example.com",
    "password": "myPassword",
    "passwordConfirmation": "myPassword"
}
```

Making this request will create a user in the database.

> _**Question**_: How can I make these requests
>
> _**Answer**_: There are various tools you can use to make HTTP requests to a web app. In the first tutorial we
> recommended you to use [Postman](https://www.postman.com/) but you can use any app that can make HTTP requests.

Now, having this user, we can log-in into our app:

```file-path
🌐 [POST] /login
```

```json
{
    "email": "john@example.com",
    "password": "myPassword"
}
```

After making this request (with the credentials of your choice), you will get a response containing
a [JWT](https://jwt.io/) token similar to this:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzd<...super long string...>"
}
```

We can use this token in our request for endpoints that need an authenticated user, like the _TweetsController.create_
route created earlier. All we have to do is to send the _Authorization: "Bearer token_string"_ header in our request. If
you are sending a request with a valid authentication token, you can then get the authenticated user like in the updated
example below:

```file-path
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { User } from 'App/Entities/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { AuthUser } from '@Typetron/Framework/Auth'
import { Request } from '@Typetron/Web'

@Controller('tweets')
@Middleware(AuthMiddleware)
export class TweetsController {

    @AuthUser()
    user: User

    @Post()
    create(request: Request) {
        const data = request.body as {content: string}
        return Tweet.create({
            content: data.content,
            user: this.user
        })
    }
}
```

You probably noticed that we used the _@Middleware(AuthMiddleware())_. This is used to protect the routes from being
accessed by users that are not authenticated. Also, it will allow us to use the _@AuthUser_ decorator to get the
authenticated user.

Let's make a request that will call this endpoint. Don't forget to add the login token in the _Authorization_ header of
your request. The token should be prefixed with the _'Bearer '_ string:

```text
📋 Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzd<...super long string...>"
```

```file-path
🌐 [POST] /tweets
```

```json
{
    "content": "my tweet content"
}
```

Now we should have our tweet created in the database.

One other thing that you probably noticed is that we type-hinted the _request.body_ property to _{content: string}_.
This is done to ensure we will have intellisense in our IDEs. We can continue doing so for every endpoint we create, but
there is a way of getting rid of this that will bring more features to the table: Forms.

#### Adding the tweet form

Forms are just classes that show what is the shape of our request. This becomes in handy when we want to add request
validations. Let's add a form for our endpoint that creates a tweet:

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
}
```

We can now use this form in our endpoints inside _TweetsController_:

That's it. Our request that creates a tweet should have only the _content_ property. Now we can use this form in our
endpoint:

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

@Controller('tweets')
@Middleware(AuthMiddleware)
export class TweetsController {

    @AuthUser()
    user: User

    @Post()
    create(form: TweetForm) {
        return Tweet.create({
            content: form.content,
            user: this.user
        })
    }
}
```

## Showing tweets

The last thing we need to do, is to show a list of tweets to the user. Let's add this in our _HomeController_ and not
in _TweetsController_ because we want to see the tweets from our root endpoint like _http://localhost:8000/_. This is
just a personal preference. You can safely add the same endpoint in the _TweetsController_, and it will work exactly the
same. Keep in mind that _TweetsController_ has the _tweet_ prefix, so you would have to use
the _http://localhost:8000/tweet_
endpoint. Don't forget to remove the old _welcome_ endpoint if you add this functionality in _HomeController_:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    tweets() {
        return Tweet.with('user').orderBy('createdAt', 'DESC').get()
    }
}
```

The _.with('user')_ method will eager-load the 'user' relationship for every tweet. This will solve the n+1 problem when
playing with databases. Find more about eager-loading in [database documentation](/docs/database)

Making a request to the endpoint [localhost:8000](http://localhost:8000/) should give use all the tweets with their
users:

#### Cleaning the response

As you probably saw, the response contains a few properties than we might not want to see, like the password property on
the user. We can hide unwanted properties using [Models](/docs/models). Let's create a model for the Tweet entity since
we already have one for the user in the _Models/User.ts_ file:

```file-path
📁 Models/Tweet.ts
```

```ts
import { Field, Model } from '@Typetron/Models'
import { User } from './User'

export class Tweet extends Model {
    @Field()
    id: number

    @Field()
    content: string

    @Field()
    user: User

    @Field()
    createdAt: Date
}
```

Once we created this, we can use it in the controller:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Get, Middleware } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
@Middleware(AuthMiddleware)
export class HomeController {

    @Get()
    tweets() {
        return TweetModel.from(Tweet.with('user').orderBy('createdAt', 'DESC').get())
    }
}
```

Let's also update the _TweetsController_ to user the _Tweet_ model, so we get a consistent response through our app:

```file-path
📁 Controllers/Http/TweetsController.ts
```

```ts
import { Controller, Middleware, Post } from '@Typetron/Router'
import { Tweet } from 'App/Entities/Tweet'
import { Tweet as TweetModel } from 'App/Models/Tweet'
import { TweetForm } from 'App/Forms/TweetForm'
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
                user: this.user
            })
        )
    }
}
```

<div class="tutorial-next-page">
    In the next part we will create the endpoint that will show the latest tweets

    <a href="likes">
        <h3>Next ></h3>
        Liking tweets
    </a>

</div>

