import { databaseConnection } from "../database-connection";
import { Category } from "../model/category"

function categoriesTable()
{
	return databaseConnection.table("category");
}

export async function categories(user_id: number): Promise<Category[]>
{
	const query = categoriesTable().orderBy("name", "asc");

	if (user_id) {
		query.where({ user_id });
	}

	return query;
}

export async function createCategory(user_id: number, name: string): Promise<Category>
{
	const rows = await categoriesTable().insert({ name, user_id }, ["id"]);
	const newCategory: Category = {
		id: rows[0].id,
		user_id,
		name
	};

	return newCategory;
}

export async function deleteCategory(user_id: number, id: number): Promise<boolean>
{
	const rowsDeleted: number = await categoriesTable().where({ user_id, id }).delete();
	return rowsDeleted == 1;
}

export async function updateCategory(user_id: number, id: number, name: string): Promise<Category | null>
{
	const rows: any[] = await categoriesTable().where({ user_id, id }).update({ name }, "*");
	if (rows.length != 1) {
		return null;
	}

	const updatedUser = rows[0];
	return updatedUser;
}
