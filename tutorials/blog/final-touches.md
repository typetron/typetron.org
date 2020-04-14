---
layout: tutorial
title: Final touches
---

## Final touches

### Organising controllers
It is a good practice to organise the controllers per resource to keep them separated, clean and have them worry 
about only one thing: managing only one resource. In our case, resources are entities, more specifically, the _Article_
entity. Let's move everything related to the _Article_ entity from _HomeController_ into an _ArticleController_:

```file-path
📁 Controllers/Http/ArticleController.ts
```
```ts
import { Controller, Delete, Get, Middleware, Patch, Post } from '@Typetron/Router';
import { ArticleForm } from 'App/Forms/ArticleForm';
import { Article } from 'App/Entities/Article';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';
import { Storage } from '@Typetron/Storage';

@Controller()
export class ArticleController {
    @Get()
    async index() {
        return Article.get();
    }

    @Get('{Article}')
    read(article: Article) {
        return article;
    }

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        await storage.put(form.image, 'public/articles');
        const article = new Article(form);
        await article.save();
        return article;
    }

    @Patch('{Article}')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm, storage: Storage) {
        await storage.put(form.image, 'public/articles');
        article.fill(form);
        await article.save();
        return article;
    }

    @Delete('{Article}')
    @Middleware(AuthMiddleware)
    async delete(article: Article) {
        await article.delete();
    }
}
```

Now, our app is a little bit more organised. Doing this should not change the functionality of the app.

### Cleaning garbage
When updating the articles we should also delete the old image of that article. The same applies when deleting an 
article: we need to delete that image from the disk too. We can do this by using the same `Storage` instance. Update the
_update_ and _delete_ methods to these ones:

```file-path
📁 Controllers/Http/ArticleController.ts
```
```ts
import { Controller, Delete, Get, Middleware, Patch, Post } from '@Typetron/Router';
import { ArticleForm } from 'App/Forms/ArticleForm';
import { Article } from 'App/Entities/Article';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';
import { Storage } from '@Typetron/Storage';

@Controller()
export class ArticleController {
    // ...

    @Patch('{Article}')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm, storage: Storage) {
        await storage.delete(`public/articles/${article.image}`);
        await storage.put(form.image, 'public/articles');
        article.fill(form);
        await article.save();
        return article;
    }

    @Delete('{Article}')
    @Middleware(AuthMiddleware)
    async delete(article: Article, storage: Storage) {
        await storage.delete(`public/articles/${article.image}`);
        await article.delete();
    }
}
```
This will take care of deleting the images from disk only if they exist.

### Control over data
Controlling the data that comes out of your app is important. For example, all the methods from our _ArticleController_,
except the _delete_ method, return a list of articles or only one article but we can't control directly what fields from
those entities are shown to the user. This is where [Models](/docs/models) come in handy. Models are simple classes that
extend the _Model_ class from _@Typetron/Models_ and have properties annotated with the _@Field_ decorator. Let's create
a model for our article:

```file-path
📁 Models/Article.ts
```
```ts
import { Field, Model } from '@Typetron/Models';

export class Article extends Model {
    @Field()
    id: number;

    @Field()
    title: string;

    @Field()
    content: string;

    @Field()
    image: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
``` 

And use it inside the _ArticleController_ for the _read_ method first:

```file-path
📁 Controllers/Http/ArticleController.ts
```
```ts
import { Article as ArticleModel } from 'App/Models/Article';
import { Article } from 'App/Entities/Article';

@Controller()
export class ArticleController {
    
    // ...

    @Get('{Article}')
    read(article: Article) {
        return ArticleModel.from(article);
    }
}
```
Now, the endpoint [localhost:8000/1](http://localhost:8000/1) will return the same thing. You will notice the the fields
from the model are the same as the fields from the entity. It may be redundant in this case to use a Model to control
the data that comes out of your app, but it's a good practice that will become handy when working on large scale
projects. This way you will have a centralized way of controlling your data. Go ahead and remove some of the fields from
the Article model and you will see that all of the routes that return articles will have their fields filtered.  

Le's update all of our routes to use the Article model. This is our final controller:

```file-path
📁 Controllers/Http/ArticleController.ts
```
```ts
import { Controller, Delete, Get, Middleware, Patch, Post} from '@Typetron/Router';
import { ArticleForm } from 'App/Forms/ArticleForm';
import { Article } from 'App/Entities/Article';
import { Article as ArticleModel } from 'App/Models/Article';
import { AuthMiddleware } from '@Typetron/Framework/Middleware';
import { Storage } from '@Typetron/Storage';

@Controller()
export class ArticleController {

    @Get()
    async index() {
        return ArticleModel.from(await Article.get());
    }

    @Get('{Article}')
    read(article: Article) {
        return ArticleModel.from(article);
    }

    @Post()
    @Middleware(AuthMiddleware)
    async add(form: ArticleForm, storage: Storage) {
        await storage.put(form.image, 'public/articles');
        const article = new Article(form);
        await article.save();
        return ArticleModel.from(article);
    }

    @Patch('{Article}')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm, storage: Storage) {
        await storage.delete(`public/articles/${article.image}`);
        await storage.put(form.image, 'public/articles');
        article.fill(form);
        await article.save();
        return ArticleModel.from(article);
    }

    @Delete('{Article}')
    @Middleware(AuthMiddleware)
    async delete(article: Article, storage: Storage) {
        await storage.delete(`public/articles/${article.image}`);
        await article.delete();
    }
}
```

### Services

If you have a complex business logic, you can move it in separate classes and then use those classes in your controllers.
Here is and example for the _update_ method only:

```file-path
📁 Services/ArticleService.ts
```
```ts
import { Article as ArticleModel } from 'App/Models/Article';
import { Storage } from '@Typetron/Storage';
import { ArticleForm } from 'App/Forms/ArticleForm';
import { Article } from 'App/Entities/Article';
import { Inject } from '@Typetron/Container';

export class ArticleService {

    @Inject()
    storage: Storage;

    async update(article: Article, form: ArticleForm) {
        await this.storage.delete(`public/assets/articles/${article.image}`);
        await this.storage.put(form.image, 'public/assets/articles');
        article.fill(form);
        await article.save();
        return ArticleModel.from(article);
    }
}
```

```file-path
📁 Controllers/Http/ArticleController.ts
```
```ts
@Controller('api')
export class ArticleController {

    @Inject()
    articleService: ArticleService;

    // ...

    @Patch('{Article}')
    @Middleware(AuthMiddleware)
    async update(article: Article, form: ArticleForm) {
        return ArticleModel.from(await this.articleService.update(article, form));
    }

    // ...
}
```

Starting from this, you can create a service method for each controller action.

In the next part we will deploy our app on three different platforms >>>>>> [Deploying](deploying).
