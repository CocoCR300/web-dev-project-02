import "dotenv/config";
import { databaseConnection } from "./database-connection";
import { createUser } from "./service/user";

const { schema } = databaseConnection;

await schema.dropTableIfExists("transaction");
await schema.dropTableIfExists("category");
await schema.dropTableIfExists("user");

await schema.createTable("user", (table) => {
	table.increments("id");

    table.text("name").notNullable().unique();
    table.text("full_name").notNullable();
    table.text("password").notNullable();
});

await schema.createTable("category", (table) => {
	table.increments("id");

    table.text("name").notNullable().unique();
    table.integer("user_id").notNullable();

    table.foreign("user_id").references("user.id");
});

await schema.createTable("transaction", (table) => {
	table.increments("id");

    table.text("description").notNullable();
    table.float("amount").notNullable();
    table.date("date").notNullable();
    table.integer("category_id").nullable();
    table.integer("user_id").notNullable();

    table.foreign("user_id").references("user.id");
    table.foreign("category_id").references("category.id");
});

await createUser("johndoe", "John Doe", "1234567890");

process.exit()
