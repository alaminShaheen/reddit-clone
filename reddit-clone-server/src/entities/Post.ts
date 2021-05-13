import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

// ObjectType() specifies to a resolver that this class is of graphql type
@ObjectType()
// Entity() specifies to mikroORM that this is a db table
@Entity()
export class Post {
	// Field is specifying what attributes will be available to my
	// graphql Post resolver through Post class.
	// Not specifying an attribute as field will exclude it from graphql type. We also need to
	// explicitly specify the graphql return types of the fields

	// Property is specifying its a db column. Again we need to specify
	// the return types of the db columns
	@Field(() => Int)
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({ type: "text" })
	title!: string;

	@Field(() => String)
	@Property({ type: "date" })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt = new Date();
}
