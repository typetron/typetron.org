import { Controller, Delete, Post, Put } from '@Typetron/Router';
import { Article } from 'App/Entities/Article';
import { ArticleForm } from 'App/Forms/ArticleForm';

@Controller('articles')
export class ArticleController {
    @Post()
    async add(form: ArticleForm) {
        const article = new Article(form);
        await article.save();
        return article;
    }

    @Put('{article}')
    async update(article: Article, form: ArticleForm) {
        article.fill(form);
        await article.save();
        return article;
    }

    @Delete('{article}')
    async delete(article: Article) {
        await article.delete();
    }
}
