import { MyContext } from 'src/types';
import "reflect-metadata";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from '../entities/User';
import { hash, verify } from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';

@InputType() 
class UsernamePasswordInput {
    @Field()
    username: string
    @Field() 
    password: string
}

@ObjectType() 
class FieldError {
    @Field()
    field: string;
    @Field() 
    message: string
}

@ObjectType() 
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true})
    async me(
        @Ctx() {req, em}: MyContext
    ) {
        if(!req.session!.userId) {
            return null;
        }
        const user = await em.findOne(User, { id: req.session!.userId as number});
        return user;
    }
    @Mutation(() => UserResponse)
    async register(
        @Arg('options')  options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        if(options.username.length <=2) {
            return {
                errors: [
                    {field: 'username', message: 'length must be greater than 2'}
                ]
            }
        }
        if(options.password.length <=3) {
            return {
                errors: [
                    {field: 'password', message: 'length must be greater than 3'}
                ]
            }
        }
        const hashedPassword = await hash(options.password)
        let user;
        try {
            console.log('adem')
           const result = await (em as EntityManager)
            .createQueryBuilder(User)
            .getKnexQuery()
            .insert({
                username: options.username, 
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
            }).returning("*");
            console.log(result)
            user = result[0];
        } catch (error) {
            console.log('adem', error)
            return {
                errors: [
                    {field: error.code, message: error.detail}
                ]
            }
        }
        return {user};
    }
    @Mutation(() => UserResponse)
    async login(
        @Arg('options')  options: UsernamePasswordInput,
        @Ctx() {em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username});
        if (!user) {
            return {
                errors: [
                    { field: 'username', message: 'That username doesnt exist'}
                ]
            }
        }
        const valid = await verify(user.password,options.password)
        if (!valid) {
            return {
                errors: [
                    { field: 'password', message: 'incorrect password'}
                ]
            }
        }

        req.session.userId = user.id

        return { user };
    }
}