import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    refreshToken!: string;

    @Column({ nullable: true })
    userAgent!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
    user!: User;
}
