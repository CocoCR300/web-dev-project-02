import "dotenv/config";
import { databaseConnection } from "./database-connection";
import { createUser } from "./service/user";

const { schema } = databaseConnection;

await schema.dropTableIfExists("user");

await schema.createTable("user", (table) => {
	table.increments("id");

    table.text("name").notNullable().unique();
    table.text("full_name").notNullable();
    table.text("password").notNullable();
});

await createUser("johndoe", "John Doe", "1234567890");

process.exit()
