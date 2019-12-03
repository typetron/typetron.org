import { Field, Form, Rules } from '@Typetron/Forms';
import { Min, Required } from '@Typetron/Validation';

export class ArticleForm extends Form {

    @Field()
    @Rules(
        Required,
        Min(5)
    )
    title: string;

    @Field()
    @Rules(
        Required
    )
    content: string;

    @Field()
    tags: number[] = [];
}
