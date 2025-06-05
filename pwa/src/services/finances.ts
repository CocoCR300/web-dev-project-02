import PouchDB from "pouchdb";
import { get } from "../database";
import type { Transaction } from "../typedef";

const DATABASE = new PouchDB("transactions");

// Delete database, uncomment when needed
//DATABASES.get("transactions")!.destroy();

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
