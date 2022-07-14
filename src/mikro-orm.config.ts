import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}'
    },
    entities: [Post],
    dbName: 'lireddit',
    debug: !__prod__,
    user: "ademyalcin",
    type: 'postgresql',
} as Parameters<typeof MikroORM.init>[0];