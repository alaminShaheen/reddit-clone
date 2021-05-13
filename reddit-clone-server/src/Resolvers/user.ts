import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../Types/types";
import argon2 from "argon2";

// if we want custom inputs instead of Args()
@InputType()
class UserInput {
	@Field(() => String)
	username: string;

	@Field(() => String)
	password: string;
}

@ObjectType()
class FieldError {
	@Field(() => String)
	field: string;

	@Field(() => String)
	message: string;
}

// used for returning from resolvers
@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() ctx: MyContext): Promise<User | null> {
		const { req, em } = ctx;
		// not logged in
		if (!req.session.userId) {
			return null;
		}
		// if user has cookie that mean went through registration or login flow so logged in
		const user = await em.findOne(User, { id: req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("registerInputs", () => UserInput)
		registerInputs: UserInput,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		const { em, req } = ctx;
		const { username, password } = registerInputs;
		if (username.length <= 2) {
			return {
				errors: [
					{
						field: "username",
						message: "Username must be greater than 2 characters",
					},
				],
			};
		} else if (password.length <= 2) {
			return {
				errors: [
					{
						field: "password",
						message: "Password must be greater than 2 characters",
					},
				],
			};
		}
		const hashedPassword = await argon2.hash(password);
		const user = em.create(User, { username, password: hashedPassword });
		try {
			await em.persistAndFlush(user);
		} catch (error) {
			if (error.code === "23505") {
				return {
					errors: [
						{
							field: "username",
							message: "Username already exists",
						},
					],
				};
			}
		}
		// logging in user after registration
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("loginInputs", () => UserInput)
		loginInputs: UserInput,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		const { em, req } = ctx;
		const { username, password } = loginInputs;
		const user = await em.findOne(User, { username });
		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "Username doesn't exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "Incorrect password",
					},
				],
			};
		}
		// setting cookie to say user is logged in
		req.session.userId = user.id;
		return { user };
	}
}
