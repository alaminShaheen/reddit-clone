import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./Resolvers/hello";
import { PostResolver } from "./Resolvers/post";
import { UserResolver } from "./Resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./Types/types";

const main = async () => {
	// initiate database
	const orm = await MikroORM.init(mikroOrmConfig);

	// create migrator instance
	const migrator = orm.getMigrator();

	// run migrations to sense entities and create tables accordingly
	await migrator.up();

	// initiate server
	const app = express();

	// set up redis
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();
	app.use(
		session({
			name: "qid",
			store: new RedisStore({ client: redisClient, disableTouch: true }),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				sameSite: "lax", //csrf
				secure: __prod__, // cookie only works in https
			},
			saveUninitialized: false,
			secret: "keyboard warrior",
			resave: false,
		})
	);

	// set up apollo server
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		// context is an object accessible by all resolvers. We are passing the orm.em i.e the db
		// instance to the context so that resolvers can access it
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
	});

	// apply our express server as middleware to our graphql server
	apolloServer.applyMiddleware({ app });

	// server listen on port 4000
	app.listen(4000, () => console.log("server started on port 4000"));
};

main().catch((err) => console.log(err));
