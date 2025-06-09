import PouchDB from "pouchdb";
import { create, get, remove, update } from "../database";
import type { Transaction } from "../typedef";

const DATABASE = new PouchDB("transactions");

// Delete database, uncomment when needed
//DATABASE.destroy();
const items = await transactions("", 0, 1);
if (items.length == 0) {
	const date = new Date();
	date.setFullYear(2000);

	saveTransaction({ _id: "", amount: -100, categoryId: "", date: new Date(), description: "Went to the mall again!" });
	saveTransaction({ _id: "", amount: 1000, categoryId: "", date, description: "Another day of hard work" });
}

DATABASE.createIndex({
	index: { fields: [ "date" ] }
});

export async function transactions(searchFilter: string, offset: number, limit: number): Promise<Transaction[]>
{
	const transactions = await get(DATABASE, "date", searchFilter, offset, limit);
	for (const transaction of transactions) {
		transaction.date = new Date((transaction.date as any) as string);
	}

	return transactions;
}

export async function saveTransaction(transaction: Transaction): Promise<boolean>
{
	if (transaction._id) {
		return update(DATABASE, transaction._id, transaction);
	}
	else {
		const id = await create(DATABASE, transaction);
		if (id) {
			transaction._id = id;
		}

		return id != "";
	}
}

export async function deleteTransaction(id: string): Promise<boolean>
{
	return await remove(DATABASE, id);
}
