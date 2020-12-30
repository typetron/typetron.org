---
layout: blog

title: Adding Images
---

## Adding images to our recipes

Adding images to our recipes is very easy. Change the _ArticleForm_ to accept an image field and make it required so all
of our recipes will have one. Like this:

```file-path
📁 Forms/ArticleForm.ts
```

```ts
import { MinLength, Required } from '@Typetron/Validation'
import { Field, Form, Rules } from '@Typetron/Forms'
import { Image } from '@Typetron/Storage'

export class ArticleForm extends Form {

    @Field()
    @Rules(Required, MinLength(5))
    title: string

    @Field()
    @Rules(Required)
    image: string | Image

    @Field()
    @Rules(
        Required
    )
    content: string
}
```

> _**Question**_: Why does the type of the image field contains the string type also?
> 
> _**Answer**_: We also type-hinted the image field to string because we will use this form to update articles as well.
> This means we can also send the image path back to the backend instead of an Image. If an image path is sent back, it
> means the user didn't change the old image, so we can skip the upload image part of our code. We will take a look at
> this in the next steps in the tutorial.


Now, change the _add_ method from _HomeController_ to save the image on the disk like so:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Post } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Storage } from '@Typetron/Storage'

@Controller()
export class HomeController {
    // ...
    @Post()
    async add(form: ArticleForm, storage: Storage) {
        await storage.save(form.image, 'public/articles')
        return Article.create(form)
    }
}
```

Using the [Storage](/docs/storage) class we get access to our disk and use it to store our image.

In order to test this we need to send a special kind of data to the server called
_form-data_. You can easily make this type of request from Postman by changing the
_body_ type from _raw_ to _form-data_ and fill it with the data we want like in the image below:


```file-path
🌐 [POST] /
```
```json
{
    "title": "Cool article",
    "content": "Cool article content",
    "image": "<imageFile>"
}
```

<p align="center" class="window">
  <img src="/images/tutorials/blog/adding-image.jpg" />
</p> 

If we test by making a POST request, we get back a successful result. But where is the image? If you take a look inside
the _public/articles_ directory in your project's root folder, you will see a weird named file. That's our image. It
just got a weird name, so it won't conflict with other files that might be in that folder, but other than that is the
exact same image we've uploaded.

All we have to do now is to link the images with the created articles because if you try to make a GET request now, you
won't get any reference to images.

#### Adding images to articles

To add images to our articles we just have to add a new property in our _Article_ entity for the image path:

```file-path
📁 Entity/Article.ts
```

```ts
import { Column, CreatedAt, Entity, ID, Options, PrimaryColumn, UpdatedAt } from '@Typetron/Database'

@Options({
    table: 'articles',
})
export class Article extends Entity {
    @PrimaryColumn()
    id: ID

    @Column()
    title: string

    @Column()
    content: string

    @Column()
    image: string

    @CreatedAt()
    createdAt: Date

    @UpdatedAt()
    updatedAt: Date
}
```

After you save the file, Typetron will synchronize the newly added field with the database by running an SQL "ALTER"
command.

Let's make a new article by making again an HTTP Post request, so the field image will get populated in the database.
The value for the image column will be the image's name including the extension. Now, if we make an HTTP GET request
to [localhost:8000](http://localhost:8000) we can see our _image_ key with the weird name we've seen in the 
_public/articles_ directory.

There is a small issue though. All the other articles don't have an image yet. You can use the _edit_ route to update
their image, but before that we need to update the endpoint to upload images too. This will get a bit complicated since
we also need to take into account that a user can also send back the original's image path back to the server when
editing an article. In this case we need to change the _ArticleForm_'s image property to be of type _string | Image_:

- _string_ in case the image value is a string with the original path
- _Image_ in case the image value is a media file

Since we have two type of our _ArticleForm.image_ property, we need to change our endpoint from _HomeController_ to
handle them both:

```file-path
📁 Controllers/Http/HomeController.ts
```

```ts
import { Controller, Patch, Post } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Article } from 'App/Entities/Article'
import { File, Storage } from '@Typetron/Storage'

@Controller()
export class HomeController {

    // ...

    @Post()
    async add(form: ArticleForm, storage: Storage) {
        if (form.image instanceof File) {
            await storage.save(form.image, 'public/articles')
        }
        return Article.create(form)
    }

    @Patch(':Article')
    async update(article: Article, form: ArticleForm, storage: Storage) {
        if (form.image instanceof File) {
            await storage.delete(`public/articles/${article.image}`)
            await storage.save(form.image, 'public/articles')
        }
        return article.save(form)
    }
}

```

#### Seeing images publicly

In order to see images in the browser, we need to activate the static assets serving feature in our app. We can easily
do this by going to _config/app.ts_ and add/uncomment the _staticAssets_ property:

```file-path
📁 config/app.ts
```

```ts
/* tslint:disable:no-default-export */
import { AppConfig, DatabaseProvider } from '@Typetron/Framework'
import { RoutingProvider } from 'App/Providers/RoutingProvider'
import { AppProvider } from 'App/Providers/AppProvider'

export default new AppConfig({
    port: 8000,
    environment: 'development',
    middleware: [],
    providers: [
        AppProvider,
        RoutingProvider,
        DatabaseProvider
    ],
    staticAssets: {
        '': ['public'] // <-- this
    }
})
```

This will allow us to see everything from our _public_ directory. Let's open one of our images in the browser by making
an HTTP GET request to _localhost:8000/articles/the-weird-image-name_, 
eg: _localhost:8000/articles/upload_73830303b8e2.jpg_. 

> _**Question**_: Where does the _/articles/_ prefix comes from?
>
> _**Answer**_: It comes from this line  _await storage.save(form.image, 'public/articles')_. Here we save our images 
> inside the _public/articles_ directory

> _**Question**_: Why doesn't the route look like this: _localhost:8000/public/articles/image-name_?
>
> _**Answer**_: This is because the _staticAssets_ setting is set to serve the files from the _public_ directory already.


<div class="tutorial-next-page">
    In the next part we will add an authentication layer to our app so only we can edit the article.

    <a href="auth">
        <h3>Next ></h3>
        Authentication
    </a>

</div>
