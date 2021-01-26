---
layout: twitter-clone

title: Update the user profile
---

## {{page.title}}

Updating the user profile is the same as updating any other entity. Before doing so, we need to update the _User_ entity
and add a few more properties:

#### Updating the User entity

```file-path
📁 Entities/User.ts
```

```ts
import { Column, HasMany, Options, Relation } from '@Typetron/Database'
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
}
```

We added the _username_ property, which is the handle of a user. We will use this later in order to mention people in
our tweets using the '@' symbol. The _bio_ will be a short description for a user. The _photo_ and _cover_ will contain
a path to an image. The _photo_ is the avatar image of the user, and the _cover_ is the image that will show up when you
will visit a user's profile.

#### Creating the UserForm

Before adding the endpoint that will update the user's information, we need to add a form that will collect and validate
the data before we make use of it. Let's create the _UserForm_ for this:

```file-path
📁 Forms/UserForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { File } from '@Typetron/Storage'
import { Required } from '@Typetron/Validation'

export class UserForm extends Form {
    @Field()
    @Rules(Required)
    name: string

    @Field()
    @Rules(Required)
    username: string

    @Field()
    bio?: string

    @Field()
    photo?: File

    @Field()
    cover?: File
}
```

As you probably saw, for the _photo_ and _cover_ properties we accept a _File_. This is because we will handle the case
when you can make a request with _photo_ and _cover_ properties being the old images paths.

#### Creating the user profile update endpoint

Now we can create the endpoint that will update the user's profile information. Let's add this in a new controller
called _UsersController_ and also update the _User_ model:

```file-path
📁 Controllers/Http/UsersController.ts
```

```ts
import { Controller, Middleware, Put } from '@Typetron/Router'
import { Inject } from '@Typetron/Container'
import { AuthUser } from '@Typetron/Framework/Auth'
import { User } from 'App/Entities/User'
import { User as UserModel } from 'App/Models/User'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { UserForm } from 'App/Forms/UserForm'
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
}
```

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

We upload an image in the public directory only when we receive an instance of a _File_ in the request, but not before
deleting the old ones, so we don't end up with images on disk that are not used.

Let's make a _form-data_ request to update the user's profile:

```file-path
🌐 [Put] /users
```

```json
{
    "username": "joe",
    "name": "John Doe",
    "bio": "Building apps with Typetron",
    "photo": imageFile,
    "cover": imageFile
}
```

#### Adding a custom validator for username

One last thing we need to fix is to restrict the username to have only letters, numbers and/or the '\_' character. We
cannot allow for spaces since it won't be possible to mention users in tweets using the '@' character. Let's add a
custom validator in a _Validators_ directory to validate the username for these characters and them update the 
_UserForm_ to use it:

```file-path
📁 Validators/IsUsername.ts
```

```ts
import { Rule } from '@Typetron/Validation'

export class IsUsername extends Rule {
    identifier = 'isUsername'

    passes(attribute: string, value: string): boolean {
        return Boolean(value.match(/^[0-9a-zA-Z_]+$/))
    }

    message(attribute: string): string {
        return `The username can only contain numbers, letters and '_'`
    }
}
```

```file-path
📁 Forms/UserForm.ts
```

```ts
import { Field, Form, Rules } from '@Typetron/Forms'
import { File } from '@Typetron/Storage'
import { Required } from '@Typetron/Validation'
import { IsUsername } from 'App/Validators/IsUsername'

export class UserForm extends Form {
    @Field()
    @Rules(Required)
    name: string

    @Field()
    @Rules(Required, IsUsername)
    username: string

    @Field()
    bio?: string

    @Field()
    photo?: File

    @Field()
    cover?: File
}
```

Now, if we make a request that contains an invalid username, we should get an error back.

<div class="tutorial-next-page">
    In the next part we will follow and unfollow users

    <a href="follow">
        <h3>Next ></h3>
        Following/Unfollowing users
    </a>

</div>

