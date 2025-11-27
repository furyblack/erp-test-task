import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Token } from '../entity/Token';
import { File } from '../entity/File';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'user',
    password: 'password',
    database: 'erp_db',
    synchronize: true,
    logging: false,
    entities: [User, Token, File],
    subscribers: [],
    migrations: [],
});
