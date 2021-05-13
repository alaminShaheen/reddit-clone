import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
	dbName: "reddit-clone",
	entities: [Post, User],
	migrations: {
		path: path.join(__dirname, "./migrations"),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	user: "postgres",
	password: "admin",
	debug: !__prod__,
	type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
