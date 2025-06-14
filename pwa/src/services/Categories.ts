import PouchDB from "pouchdb"
import { create, get, remove, update } from "../database"
import type { Category } from "../typedef"
import { API_URL } from "../globals";

const ENDPOINT = `${API_URL}/graphql`;
const DATABASE = new PouchDB("categories")

DATABASE.createIndex({
	index: { fields: ["name"] }
})

export async function categories(): Promise<Category[]>
{
	const query = `#graphql
		query categories {
			categories {
				id
				name
			}
		}
	`;

	const token = localStorage.getItem("token");
	try {
		const response = await fetch(ENDPOINT, {
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "categories", query })
		});
		const payload = await response.json();
		const categories = payload.data.categories;
		for (const category of categories) {
			category._id = category.id;
		}

		return categories;
	} 
	catch (err) {
		console.error(err);
	}

	const categories = await get(DATABASE, "name");
	return categories;
}

export async function saveCategory(category: Category): Promise<Category | null>
{
	let createdCategory: Category;
	const query = `#graphql
		mutation categories($input: ${ category._id == null ? "Create" : "Update" }CategoryInput!) {
			${ category._id == null ? "create" : "update" }Category(input: $input) {
				id
				name
			}
		}
	`;

	const variables: any = {
		input: {
			name: category.name
		}
	};

	if (category._id != null) {
		variables.input._id = category._id;
	}

	const token = localStorage.getItem("token");
	try {
		const response = await fetch(ENDPOINT, {
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "categories", query, variables })
		});

		const payload = await response.json();
		if (category._id == null) {
			createdCategory = payload.data.createCategory;
		}
		else {
			createdCategory = payload.data.updateCategory;
		}
	} 
	catch (err) {
		console.error(err);
		return null;
	}

	if (category._id) {
		await update(DATABASE, category._id, createdCategory!);
	}
	else {
		const id = await create(DATABASE, createdCategory);
		if (id) {
			category._id = parseInt(id);
		}

	}

	return createdCategory;
}
export async function deleteCategory(id: number): Promise<boolean> {
	const query = `#graphql
		mutation categories {
			deleteCategory(id: ${id}) {
				id
			}
		}
	`;

	const token = localStorage.getItem("token");
	try {
		const response = await fetch(ENDPOINT, {
			headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
			method: "POST",
			body: JSON.stringify({ operationName: "categories", query })
		});

		const payload = await response.json();
		return payload.data.deleteCategory != undefined;
	} 
	catch (err) {
		console.error(err);
		return false;
	}

	await remove(DATABASE, id);
	return true;
}
