import { Column, Entity, ID, HasMany, Relation } from '@Typetron/Database'
import { Comment } from 'App/Entities/Comment'

export class Article extends Entity {
    @Column()
    id: ID

    @Column()
    title: string

    @Column()
    content: string

    @Column()
    createdAt: Date

    @Column()
    updatedAt: Date

    @Relation(() => Comment, 'article')
    comments: HasMany<Comment>
}
