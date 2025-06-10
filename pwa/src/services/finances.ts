import PouchDB from "pouchdb";
import { create, get, remove, update } from "../database";
import { DEFAULT_CATEGORY, type Transaction } from "../typedef";

const API_URL = "http://localhost:4000/graphql";
const DATABASE = new PouchDB("transactions");
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDk1MDYxODA1MjcsImlzcyI6Imh0dHBzOi8vdW5hLmFjLmNyIiwibmFtZSI6ImpvaG5kb2UiLCJzdWIiOjF9.XRL0ZywhaWUCnz1sxPBF1ZnET8gpci5coRIwF439Mfo";

// Delete database, uncomment when needed
//DATABASE.destroy();
const items = await transactions("", 0, 1);
if (items.length == 0) {
	const date = new Date();
	date.setFullYear(2000);

	//saveTransaction({ _id: "", amount: -100, category_id: "", date: new Date(), description: "Went to the mall again!" });
	//saveTransaction({ _id: "", amount: 1000, category_id: "", date, description: "Another day of hard work" });
}

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
	
	try {
		const response = await fetch(API_URL, {
			headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "transactions", query })
		});
		const payload = await response.json();
		console.log("respuesta de la api", payload)
		if(Array.isArray(payload?.data?.transactions)){
			transactions = payload.data.transactions;
		}else{
			throw new Error("formato de la api invalido")
		}
		//transactions = payload.data.transactions;
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

	try {
		const response = await fetch(API_URL, {
			headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
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
		query transactions {
			deleteTransaction(id: ${id}) {
				id
			}
		}
	`;

	try {
		const response = await fetch(API_URL, {
			headers: { "Content-Type": "application/json" },
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
