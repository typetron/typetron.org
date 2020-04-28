import { Controller, Delete, Get, Patch, Post } from '@Typetron/Router';
import { Article } from 'App/Entities/Article';
import { ArticleForm } from 'App/Forms/ArticleForm';

@Controller('articles')
export class ArticleController {
    @Get()
    async all() {
        return Article.get();
    }

    @Post()
    async add(form: ArticleForm) {
        const article = new Article(form);
        await article.save();
        return article;
    }

    @Patch(':Article')
    async update(article: Article, form: ArticleForm) {
        await article.fill(form).save();
        return article;
    }

    @Delete(':Article')
    async delete(article: Article) {
        await article.delete();
    }
}
