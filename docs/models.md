---
layout: docs
title: Models
---

## {{ page.title }}

Models are simple classes that define how the output of your [Controllers](/docs/controllers) should look like.
To create a model simply create a class that extends the `Model` class inside `Models` directory.
Make sure to add the `@Field` decorator to each filed you want to show to the user:
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
    author: string;

    @Field()
    createdAt: Date;
}

```

Having this done, you can use the newly created model inside your controller.
```ts
import { Controller, Get } from '@Typetron/Router'; 
import { Article as ArticleModel } from 'App/Models/Article';
import { Article } from 'App/Entities/Article';

@Controller('articles')
class ArticleController {
    
    @Get()
    async all() {
        return ArticleModel.from(await Article.all());
    }
}
```

This is a great way to expose to the user only what fields are needed and not show them fields with sensitive
data like password hashes.
