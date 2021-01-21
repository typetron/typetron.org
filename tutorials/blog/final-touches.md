---
layout: blog

title: Final touches
---

## Final touches

### Organising controllers

It is a good practice to organise the controllers per resource to keep them separated, clean and have them worry about
only one thing: managing only one resource. In our case, resources are entities, more specifically, the _Article_
entity. Let's move everything related to the _Article_ entity from _HomeController_ into an _ArticleController_:

```file-path
📁 Controllers/Http/ArticleController.ts
```

```ts
import { Controller, Delete, Get, Middleware, Put, Post } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Article } from 'App/Entities/Article'
import { File, Storage } from '@Typetron/Storage'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'

@Controller()
export class ArticlesController {

    @Get()
    index() {
        return Article.get()
    }

    @Get(':Article')
    read(article: Article) {
        return article
    }

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        if (form.image) {
            await storage.save(form.image, 'public/articles')
        }
        return Article.create(form)
    }

    @Put(':Article')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm, storage: Storage) {
        if (form.image) {
            await storage.delete(`public/articles/${article.image}`)
            await storage.save(form.image, 'public/articles')
        }
        return article.save(form)
    }

    @Delete(':Article')
    @Middleware(AuthMiddleware)
    async delete(article: Article) {
        await article.delete()
    }
}
```

Now, our app is a little more organised. Doing this should not change the functionality of the app. Don't forget to
remove the HomeController since we don't use it anymore.

### Cleaning garbage

When deleting articles, we should also delete the image of that article. We can do this by using the same
[Storage](/docs/storage) instance. Update the  _delete_ method to this:

```file-path
📁 Controllers/Http/ArticleController.ts
```

```ts
import { Controller, Middleware, Post, Put, Get, Delete } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Article } from 'App/Entities/Article'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Storage } from '@Typetron/Storage'

@Controller()
export class ArticlesController {

    @Get()
    index() {
        return Article.get()
    }

    @Get(':Article')
    read(article: Article) {
        return article
    }

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        if (form.image) {
            await storage.save(form.image, 'public/articles')
        }
        return Article.create(form)
    }

    @Put(':Article')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm, storage: Storage) {
        if (form.image) {
            await storage.delete(`public/articles/${article.image}`)
            await storage.save(form.image, 'public/articles')
        }
        return article.save(form)
    }

    @Delete(':Article')
    @Middleware(AuthMiddleware)
    async delete(article: Article, storage: Storage) {
        await storage.delete(`public/articles/${article.image}`)
        await article.delete()
    }
}
```

This will take care of deleting the images from disk only if they exist.

### Control over data

Controlling the data that comes out of your app is important. For example, all the methods from our _ArticleController_,
except the _delete_ method, return a list of articles or only one article, but we can't control directly what fields
from those entities are shown to the user. This is where [Models](/docs/models) come in handy. Models are simple classes
that extend the _Model_ class from _@Typetron/Models_ and have properties annotated with the _@Field_ decorator. Let's
create a model for our article:

```file-path
📁 Models/Article.ts
```

```ts
import { Field, Model } from '@Typetron/Models'

export class Article extends Model {
    @Field()
    id: number

    @Field()
    title: string

    @Field()
    content: string

    @Field()
    image: string

    @Field()
    createdAt: Date

    @Field()
    updatedAt: Date
}
``` 

Let 's use it inside our _ArticleController_:

```file-path
📁 Controllers/Http/ArticleController.ts
```

```ts
import { Controller, Delete, Get, Middleware, Put, Post } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Article } from 'App/Entities/Article'
import { File, Storage } from '@Typetron/Storage'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Article as ArticleModel } from 'App/Models/Article'

@Controller()
export class ArticlesController {

    @Get()
    async index() {
        return ArticleModel.from(Article.get())
    }

    @Get(':Article')
    read(article: Article) {
        return ArticleModel.from(article)
    }

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        if (form.image) {
            await storage.save(form.image, 'public/articles')
        }
        return ArticleModel.from(Article.create(form))
    }

    @Put(':Article')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm, storage: Storage) {
        if (form.image) {
            await storage.delete(`public/articles/${article.image}`)
            await storage.save(form.image, 'public/articles')
        }
        return ArticleModel.from(article.save(form))
    }

    @Delete(':Article')
    @Middleware(AuthMiddleware)
    async delete(article: Article, storage: Storage) {
        await storage.delete(`public/articles/${article.image}`)
        await article.delete()
    }
}
```

Now, the endpoint [localhost:8000/1](http://localhost:8000/1) will return the same thing. You will notice the fields
from the model are the same as the fields from the entity. It may be redundant in this case to use a Model to control
the data that comes out, but it's a good practice to have in mind. It will become handy when working on large scale
projects. This way you will have a centralized way of controlling your data. To test this, remove some properties from
the Article model, and you will see that all the routes that return articles will have their fields filtered based on
how _ArticleModel_ looks like.

### Services

If you have a complex business logic, you can move it in separate classes and then use those classes in your
controllers. Here is and example for the _create_, _update_ and _delete_ methods:

```file-path
📁 Services/ArticleService.ts
```

```ts
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Storage } from '@Typetron/Storage'
import { Article as ArticleModel } from 'App/Models/Article'
import { Article } from 'App/Entities/Article'
import { Inject } from '@Typetron/Container'

export class ArticleService {

    @Inject()
    storage: Storage

    async add(form: ArticleForm) {
        if (form.image) {
            await this.storage.save(form.image, 'public/articles')
        }
        return ArticleModel.from(Article.create(form))
    }

    async update(article: Article, form: ArticleForm) {
        if (form.image) {
            await this.storage.delete(`public/articles/${article.image}`)
            await this.storage.save(form.image, 'public/articles')
        }
        return ArticleModel.from(article.save(form))
    }

    async delete(article: Article) {
        await this.storage.delete(`public/articles/${article.image}`)
        await article.delete()
    }
}
```

```file-path
📁 Controllers/Http/ArticleController.ts
```

```ts
import { Controller, Delete, Get, Middleware, Put, Post } from '@Typetron/Router'
import { ArticleForm } from 'App/Forms/ArticleForm'
import { Article } from 'App/Entities/Article'
import { AuthMiddleware } from '@Typetron/Framework/Middleware'
import { Article as ArticleModel } from 'App/Models/Article'
import { Inject } from '@Typetron/Container'
import { ArticleService } from 'App/Services/ArticleService'

@Controller()
export class ArticlesController {

    @Inject()
    articleService: ArticleService

    @Get()
    async index() {
        return ArticleModel.from(Article.get())
    }

    @Get(':Article')
    read(article: Article) {
        return ArticleModel.from(article)
    }

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm) {
        return this.articleService.add(form)
    }

    @Put(':Article')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm) {
        return this.articleService.update(article, form)
    }

    @Delete(':Article')
    @Middleware(AuthMiddleware)
    async delete(article: Article) {
        return this.articleService.delete(article)
    }
}
```

The _@Inject()_ will create a singleton instance of _Storage_ or _ArticleService_ automatically for you when used. You
can learn more about _@Inject()_ in the [container section from docs](/docs/container.md).

<div class="tutorial-next-page">
    In the next part we will deploy our app on three different platforms.

    <a href="deploying">
        <h3>Next ></h3>
        Deploying
    </a>

</div>
