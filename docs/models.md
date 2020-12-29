---
layout: docs

title: Models
---

## {{ page.title }}

Models are simple classes that define how the output of your [Controllers](/docs/controllers) should look like. To
create a model simply create a class that extends the _Model_ class inside _Models_ directory. Make sure to add the
_@Field_ decorator to each field you want to show to the user:

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
    author: string

    @Field()
    createdAt: Date
}

```

Having this done, you can use the newly created model inside your controller.

```ts
import { Controller, Get } from '@Typetron/Router'
import { Article as ArticleModel } from 'App/Models/Article'
import { Article } from 'App/Entities/Article'

@Controller('articles')
class ArticleController {

    @Get()
    async all() {
        return ArticleModel.from(Article.all())
    }
}
```

This is a great way to expose only what fields are needed and not show the fields with sensitive data like password
hashes.

#### Array of Models

There are cases when you have a model with a property that is an array of another Model. In this case, when linking
arrays of models, you should use the _@FieldMany_ decorator to let Typetron know you are using a collection of models:

```ts
import { Field, FieldMany, Model } from '@Typetron/Models'

class Article extends Model {
    @Field()
    title: string

    @Field()
    content: string
}

export class User extends Model {
    @Field()
    id: number

    @Field()
    email: string

    @FieldMany(Article)
    articles: Article[]
}
```

If you are not using the _@FieldMany_ decorator, you won't get a desired response.
