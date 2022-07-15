import { MyContext } from 'src/types';
import "reflect-metadata";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { User } from '../entities/User';
import { hash } from 'argon2';


@InputType() 
class UsernamePasswordInput {
    @Field()
    username: string
    @Field() 
    password: string
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg('options')  options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ) {
        const hashedPassword = await hash(options.password)
        const user = em.fork({}).create(User, {
            username: options.username, 
            password: hashedPassword 
        });
        await em.persistAndFlush(user);
        return user;
    }
}