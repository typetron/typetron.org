---
layout: tutorials
title: Search
---

## {{ page.title }}
_In progress_

```ts
// ...

@Controller()
export class HomeController {

    // ...

    @Get()
    async index(@Query('search') search: string) {
        const query = Article.with('user', 'tags').orderBy('createdAt', 'DESC');
        if (search) {
            query.whereLike('title', `%${search}%`);
        }
        return query.get();
    }
}
