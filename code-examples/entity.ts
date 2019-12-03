import { Column, Entity, ID, OneToMany } from '@Typetron/Database';
import { Comment } from 'App/Entities/Comment';

export class Article extends Entity {
    @Column()
    id: ID;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;

    @OneToMany(() => Comment, 'article')
    comments: Comment[];
}
