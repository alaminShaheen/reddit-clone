import { MyContext } from "src/Types/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	posts(
		// accessing context to get hold of the db instance we passed from
		// the ApolloServer instance we created
		@Ctx() ctx: MyContext
	): Promise<Post[]> {
		const { em } = ctx;
		return em.find(Post, {});
	}

	// return type of query saying it can either be a Post or null
	@Query(() => Post, { nullable: true })
	post(
		// specify the name of field with which we want to fetch in a post which in this case is id
		// and also specify the return type in Arg()
		@Arg("id", () => Int) id: number,
		@Ctx() ctx: MyContext
	): Promise<Post | null> {
		const { em } = ctx;
		return em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async createPost(
		@Arg("title", () => String) title: string,
		@Ctx() ctx: MyContext
	): Promise<Post> {
		const { em } = ctx;
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id", () => Int) id: number,
		@Arg("title", () => String, { nullable: true }) title: string,
		@Ctx() ctx: MyContext
	): Promise<Post | null> {
		const { em } = ctx;
		const post = await em.findOne(Post, { id });
		if (!post) return null;
		if (typeof title !== undefined) {
			post.title = title;
			em.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => Boolean, { nullable: true })
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() ctx: MyContext
	): Promise<boolean> {
		const { em } = ctx;
		try {
			const res = await em.nativeDelete(Post, {id});
			return res ? true : false;
		} catch (error) {
			console.log(error.message);
			return false;
		}
	}
}
