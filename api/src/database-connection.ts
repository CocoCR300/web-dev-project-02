import knex from "knex";

const databaseFilename = process.env["DATABASE_FILENAME"];

function onQuery({ sql, binding }) {
	const query = databaseConnection.raw(sql, binding).toQuery();
	console.log("[DB] ", query)
}

export const databaseConnection = knex({
	client: "better-sqlite3",
	connection: {
		filename: databaseFilename
	},
	useNullAsDefault: true,
})

databaseConnection.on("query", onQuery)
