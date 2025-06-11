import PouchDB from "pouchdb";
import { create, get, remove, update } from "../database";
import { DEFAULT_CATEGORY, type Transaction } from "../typedef";
import { API_URL } from "../globals";

const ENDPOINT = `${API_URL}/graphql`;
const DATABASE = new PouchDB("transactions");

// Delete database, uncomment when needed
//DATABASE.destroy();
transactions("", 0, 1).then(items => {
	if (items.length == 0) {
		const date = new Date();
		date.setFullYear(2000);

		//saveTransaction({ _id: "", amount: -100, category_id: "", date: new Date(), description: "Went to the mall again!" });
		//saveTransaction({ _id: "", amount: 1000, category_id: "", date, description: "Another day of hard work" });
	}
});

DATABASE.createIndex({
	index: { fields: [ "date" ] }
});

export async function transactions(searchFilter: string, offset: number, limit: number): Promise<Transaction[]>
{
	let transactions: Transaction[] = [];
	const query = `#graphql
		query transactions {
			transactions(offset: ${offset}, limit: ${limit}, search_filter: "${searchFilter}") {
				id
				amount
				date
				description
				category {
					id
					name
				}
			}
		}
	`;
	
	const token = localStorage.getItem("token");
	
	try {
		const response = await fetch(ENDPOINT, {
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "transactions", query })
		});
		const payload = await response.json();
		transactions = payload.data.transactions;
	} 
	catch (err) {
		console.error(err);
		transactions = await get(DATABASE, "date", searchFilter, offset, limit);
	}

	for (const transaction of transactions) {
		transaction.date = new Date((transaction.date as any) as string);

		if (transaction.category == null) {
			transaction.category = DEFAULT_CATEGORY;
		}
	}

	return transactions;
}

export async function saveTransaction(transaction: Transaction): Promise<Transaction | null>
{
	const query = `#graphql
		mutation transactions($input: ${transaction._id == null ? "Create" : "Update" }TransactionInput!) {
			${ transaction._id == null ? "create" : "update" }Transaction(input: $input) {
				id
				amount
				date
				description
				category {
					id
					name
				}
			}
		}
	`;

	const variables: any =  {
		input: {
			amount: transaction.amount,
			category_id: transaction.category_id == 0 ? null : transaction.category_id,
			date: transaction.date,
			description: transaction.description
		}
	};

	if (transaction._id != null) {
		variables.input._id = transaction._id;
	}

	const token = localStorage.getItem("token");
	try {
		const response = await fetch(ENDPOINT, {
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "transactions", query: `${query}`, variables })
		});

		const payload = await response.json();
		let newTransaction: any;
		if (transaction._id == null) {
			newTransaction = payload.data.createTransaction;
		}
		else {
			newTransaction = payload.data.updateTransaction;
		}

		if (transaction._id != null) {
			await update(DATABASE, newTransaction.id, newTransaction);
		}
		else {
			await create(DATABASE, newTransaction);
			newTransaction._id = newTransaction.id;
		}

		newTransaction.date = new Date(newTransaction.date);
		if (transaction.category == null) {
			transaction.category = DEFAULT_CATEGORY;
		}

		return newTransaction;
	} 
	catch (err) {
		console.error(err);
		return null;
	}
}

export async function deleteTransaction(id: number): Promise<boolean>
{
	const query = `#graphql
		mutation transactions {
			deleteTransaction(id: ${id}) {
				id
			}
		}
	`;

	const token = localStorage.getItem("token");
	try {
		const response = await fetch(ENDPOINT, {
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "transactions", query })
		});

		const payload = await response.json();
		const deletedId = payload.data.deleteTransaction;

		if (deletedId) {
			await remove(DATABASE, deletedId);
		}

		return true;
	} 
	catch (err) {
		console.error(err);
		return false;
	}
}
