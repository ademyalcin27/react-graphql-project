import { __prod__ } from './constants';
import { UserResolver } from './resolvers/user';
import "reflect-metadata";
import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';
import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import session from "express-session";
import { createClient } from "redis";
import connectRedis from 'connect-redis';
import cors from 'cors';

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    const app = express();
    let RedisStore = connectRedis(session);
    let redisClient = createClient();
    
    app.use(cors({
        origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
        credentials: true,
    }))
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
                sameSite: 'lax',// csrf
                secure: __prod__ // cookie only works in https at proud
            },
            saveUninitialized: false,
            secret: "sdasdasdasdasdasd", // will update later
            resave: false,
        })
    )
    

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({ em: orm.em, req, res })
    })
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false
    });
    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    });
}
main().catch((err) => {
    console.log(err);
})
