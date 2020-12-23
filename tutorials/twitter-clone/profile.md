---
layout: twitter-clone

title: Update the user profile
---

## {{page.title}}

Updating the user profile is the same as updating any other entity. Before doing so, we need to update the _User_ entity
and add a few more properties:

#### Updating the User entity

This entity will store the images and videos names of tweets. We also need to update the _Tweet_ entity to reflect the
addition of this entity:

```file-path
📁 Entities/User.ts
```

```ts
import { Column, HasMany, Options, Relation } from '@Typetron/Database'
import { User as Authenticable } from '@Typetron/Framework/Auth'
import { Tweet } from 'App/Entities/Tweet'
import { Like } from 'App/Entities/Like'

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
}
```

We added the _username_ property, which is the handle of a user. We wil use this later in order to mention people in our
tweets using the '@' symbol. The _bio_ will be a short description fo a user. The _photo_ and _cover_ will contain a
path to an image. The _photo_ is the avatar image of the user, and the _cover_ is the image that will show up when you
will visit a user's profile.

#### Creating the UserForm

Before adding the endpoint that will update the user's information, we need to add a form that will collect and validate
the data before we make use of it. Let's create the _UserForm_ for this:

```file-path
📁 Forms/UserForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { Image } from '@Typetron/Storage'
import { Required } from '@Typetron/Validation'

export class UserForm extends Form {
    @Field()
    @Rules(
        Required
    )
    name?: string

    @Field()
    @Rules(
        Required
    )
    bio?: string

    @Field()
    photo?: Image | string

    @Field()
    cover?: Image | string
}
```

As you probably saw, for the _photo_ and _cover_ properties we accept an _Image_ or a _string_. This is because we will
handle the case when you can make a request with _photo_ and _cover_ properties being the old images paths.

#### Creating the user profile update endpoint

Now we can create the endpoint that will update the user's profile information. Let's add this in a new controller
called _UserController_ and also update the _User_ model:

```file-path
📁 Models/User.ts
```
```ts
import { Field, Model } from '@Typetron/Models'

export class User extends Model {
    @Field()
    id: number

    @Field()
    username: string

    @Field()
    name: string

    @Field()
    photo: string

    @Field()
    cover: string

    @Field()
    bio?: string
}
```

```file-path
📁 Controllers/Http/UserController.ts
```

```ts
import { Controller, Middleware, Patch } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { UserForm } from 'App/Forms/UserForm'
import { File, Storage } from '@Typetron/Storage'

@Controller('user')
@Middleware(AuthMiddleware)
export class UserController {

    @AuthUser()
    user: User

    @Inject()
    storage: Storage

    @Patch()
    async update(form: UserForm) {
        
        if (form.photo instanceof File) {
            await this.storage.delete(`public/${this.user.photo}`)
            form.photo = await this.storage.put(form.photo, 'public')
        }
        if (form.cover instanceof File) {
            await this.storage.delete(`public/${this.user.cover}`)
            form.cover = await this.storage.put(form.cover, 'public')
        }
        await this.user.save(form)
        return UserModel.from(this.user)
    }
}
```

We only upload an image in the public directory only when we receive an instance of a _File_ in the request, but not
before deleting the old ones, so we don't end up with images on disk that are not used. If the user sends back a string
for _photo_ or _cover_ images, it means he sent the old paths of those images.

<div class="tutorial-next-page">
    In the next part we will follow and unfollow users

    <a href="follow">
        <h3>Next ></h3>
        Following/Unfollowing users
    </a>

</div>

