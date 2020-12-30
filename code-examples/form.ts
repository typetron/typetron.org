import { Field, Form, Rules } from '@Typetron/Forms'
import { MinLength, Required } from '@Typetron/Validation'

export class ArticleForm extends Form {

    @Field()
    @Rules(
        Required,
        MinLength(5)
    )
    title: string

    @Field()
    @Rules(
        Required
    )
    content: string

    @Field()
    tags: number[] = []
}
