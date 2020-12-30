import { Controller, Delete, Get, Patch, Post } from '@Typetron/Router'
import { Article } from 'App/Entities/Article'
import { ArticleForm } from 'App/Forms/ArticleForm'

@Controller('articles')
export class ArticleController {
    @Get()
    all() {
        return Article.get()
    }

    @Post()
    add(form: ArticleForm) {
        return Article.create(form)
    }

    @Patch(':Article')
    update(article: Article, form: ArticleForm) {
        return article.fill(form).save()
    }

    @Delete(':Article')
    async delete(article: Article) {
        await article.delete()
    }
}
