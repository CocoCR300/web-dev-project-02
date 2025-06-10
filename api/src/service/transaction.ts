import { databaseConnection } from "../database-connection";
import { Category } from "../model/category";
import { Transaction } from "../model/transaction"

function transactionsTable()
{
	return databaseConnection.table("transaction");
}

export async function transactions(user_id: number, limit?: number, offset?: number, search_filter?: string): Promise<any[]>
{
	const query = transactionsTable()
		.orderBy("date", "desc")
		.leftJoin("category", "transaction.category_id", "category.id")
		.select([
			"transaction.id",
			"amount",
			"date",
			"description",
			"category.id as category_id",
			"category.name as category_name",
			"transaction.user_id"
		]);

	if (search_filter) {
		query
			.where("category_name", "like", `%${search_filter}%`)
			.orWhere("description", "like", `%${search_filter}%`);
	}
	if (user_id) {
		query.andWhere("transaction.user_id", user_id);
	}
	if (limit > 0) {
		query.limit(limit);
	}
	if (offset) {
		query.offset(offset);
	}

	return query;
}

export async function createTransaction(user_id: number, amount: number, date: Date,  description: string, category_id: number | null): Promise<Transaction>
{
	const rows = await transactionsTable().insert({ amount, date, category_id, description, user_id }, ["id"]);

	const newTransaction: Transaction = {
		id: rows[0].id,
		amount,
		date,
		description,
		user_id,
		category: null
	};

	if (category_id) {
		const categories: any[] = await databaseConnection.table("category").where({ id: category_id }).select(["name"]);

		newTransaction.category = {
			id: category_id,
			name: categories[0].name,
			user_id: user_id
		};
	}

	return newTransaction;
}

export async function deleteTransaction(user_id: number, id: number): Promise<boolean>
{
	const rowsDeleted: number = await transactionsTable().where({ user_id, id }).delete();
	return rowsDeleted == 1;
}

export async function updateTransaction(user_id: number, id: number, amount?: number, date?: Date, category_id?: number, description?: string): Promise<Transaction | null>
{
	const rows: any[] = await transactionsTable().where({ user_id, id }).update({ amount, date, category_id, description }, "*");
	if (rows.length != 1) {
		return null;
	}

	const updatedTransaction: Transaction = rows[0];

	if (category_id) {
		const categories: any[] = await databaseConnection.table("category").where({ id: category_id }).select(["*"]);
		const category: Category = categories[0];

		updatedTransaction.category = category;
	}
	return updatedTransaction;
}
