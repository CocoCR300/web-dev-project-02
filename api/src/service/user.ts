import { assert } from "node:console";
import { createToken } from "../auth";
import { databaseConnection } from "../database-connection";
import { User } from "../model/user";

function usersTable()
{
	return databaseConnection.table("user");
}

export async function users(limit: number = 0): Promise<User[]>
{
	const query = usersTable().orderBy("name", "asc");

	if (limit > 0) {
		query.limit(limit);
	}
	return query;
}

export async function userById(id: number): Promise<User | null>
{
	return usersTable().first().where({ id });
}

export async function userByName(name: string): Promise<User | null>
{
	return usersTable().first().where({ name });
}

export async function createUser(name: string, full_name: string, password: string): Promise<User>
{
	const rows = await usersTable().insert({ name, full_name, password }, ["id"]);
	const newUser: User = {
		id: rows[0].id,
		full_name,
		name,
		password
	};

	return newUser;
}

export async function deleteUser(id: number): Promise<boolean>
{
	const rowsDeleted: number = await usersTable().where({ id }).delete();
	return rowsDeleted == 1;
}

export async function updateUser(id: number, name?: string, full_name?: string, password?: string): Promise<User | null>
{
	const rows: any[] = await usersTable().where({ id }).update({ name, full_name, password }, "*");
	if (rows.length != 1) {
		return null;
	}

	const updatedUser = rows[0];
	return updatedUser;
}
