---
layout: tutorial
title: Adding Images
---

## Adding images to our recipes

Adding images to our recipes is very easy. Change the _ArticleForm_ to accept and
image field and make it required so all of our recipes will have one. Like this:

```ts
import { MinLength, Required } from '@Typetron/Validation';
import { Field, Form, Rules } from '@Typetron/Forms';
import { Image } from '@Typetron/Storage';

export class ArticleForm extends Form {

    @Field()
    @Rules(
        Required,
        MinLength(5)
    )
    title: string;

    @Field()
    @Rules(
        Required,
    )
    image: Image;

    @Field()
    @Rules(
        Required
    )
    content: string;
}
```

Now, change the  _add_ method from _HomeController_ to deal with this image: in this
case, just to save it on disk like so:

```ts

@Controller(')
export class HomeController {
    // ...
    async add(form: ArticleForm, storage: Storage) {
        await storage.put(form.image, 'public/articles');
        const article = new Article(form);
        await article.save();
        return article;
    }
}
```

Using the [Storage](/docs/files) class we get access to our disk and use it to store our image.

In order to test this we need to send a special kind of data to the server called
_form-data_. You can easily make this type of request from Postman by changing the
_body_ type from _raw_ to _form-data_ and fill it with the data we want like in the
image below:


<p align="center" class="window">
  <img src="/images/tutorials/blog/adding-image.jpg" />
</p> 

If we test by making a POST request we get back a successful result. But where is
the image? If you take a look inside the _public/articles_ directory in your 
project's root folder, you will see a weird named file. That's our image. It just 
got a weird name so it won't conflict with other files that might be in that folder
but other than that is the exact same image we've uploaded.

All we have to do now is to link the images with the created articles because if
you try to make a GET request now, you won't get any reference to images.

To add images to our articles we just have to add a new column in our _articles_
table that will store our image's name:

```sql
ALTER TABLE articles ADD image VARCHAR;
```

Then we have to update our _Article_ entity to have this property:

```ts
import { Column, CreatedAt, Entity, ID, Meta, UpdatedAt } from '@Typetron/Database';

@Meta({
    table: 'articles'
})
export class Article extends Entity {
    @Column()
    id: ID;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    image: string;

    @CreatedAt()
    createdAt: Date;

    @UpdatedAt()
    updatedAt: Date;
}
```

Now, if we make a HTTP GET request to [localhost:8000](http://localhost:8000) we can see our
_image_ key with the weird name we've seen in the _public/articles_ directory.

To actually see our image we will have to set up static file serving feature. All we have to
do is to tell Typetron where these static files are by changing the config from _config/app.js_
file. Luckily, we can easily do this by uncommenting the _staticAssets_ key in that file. 
This will give Typetron access to show the files from the _public_ directory when you access 
them. To test this, make a HTTP GET request to `localhost:8000/articles/<the weird image name>`, eg:
`localhost:8000/articles/upload_73830303b8e292a87942bfb6f46e0663.jpg` to see your image.  
 
In the next part we will add an authentication layer to our app so only we can edit the
 article. >>>>>> [Authentication](auth).
