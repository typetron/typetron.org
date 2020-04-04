import { Controller, Delete, Patch, Post } from '@Typetron/Router';
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

    @Patch('{Article}')
    async update(article: Article, form: ArticleForm) {
        article.fill(form);
        await article.save();
        return article;
    }

    @Delete('{Article}')
    async delete(article: Article) {
        await article.delete();
    }
}
