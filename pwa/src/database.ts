import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

type Sort = (string | { [propName: string]: "asc" | "desc" })[];

PouchDB.plugin(PouchDBFind);

const DATABASES = new Map<string, PouchDB.Database>();
DATABASES.set("categories", new PouchDB("categories"));
DATABASES.set("transactions", new PouchDB("transactions"));

// Delete database, uncomment when needed
//DATABASES.get("transactions")!.destroy();

DATABASES.get("transactions")!.createIndex({
	index: { fields: [ "date" ] }
});

export async function get<T>(databaseName: string, sortBy: string, id: string = "", offset?: number, limit?: number): Promise<T[]>
{
	const database = DATABASES.get(databaseName);
	if (!database) {
		debugger;
		throw new Error();
	}

	try {
		// https://pouchdb.com/guides/mango-queries.html#query-language
		// "Note that we are specifying that ... must be greater than or equal to null, which is a workaround for the fact that the Mango query language requires us to have a selector."
		const selector: PouchDB.Find.Selector = { [sortBy]: { $gte: null } };
		const sort: Sort = [ { [sortBy]: "desc" } ];
		const result = await database.find({ selector, sort, skip: offset, limit });
		return result.docs as T[];
	}
	catch (err) {
		console.error(err);
		return [];
	}
}

export async function create<T>(databaseName: string, item: T): Promise<string>
{
	const database = DATABASES.get(databaseName);
	if (!database) {
		debugger;
		throw new Error();
	}

	try {
		const result = await database.post<any>(item);
		if (result.ok) {
			return result.id;
		}
	}
	catch (err) {
		console.error(err);
	}

	return "";
}

export async function remove<T>(databaseName: string, id: string): Promise<boolean>
{
	const database = DATABASES.get(databaseName);
	if (!database) {
		debugger;
		throw new Error();
	}
	try {
		const doc = await database.get(id);
		if (!doc) {
			return true;
		}

		const result = await database.remove(doc);
		return result.ok;
	}
	catch (err) {
		console.error(err);
		return false;
	}
}


export async function update(databaseName: string, id: string, item: any): Promise<boolean>
{
	const database = DATABASES.get(databaseName);
	if (!database) {
		debugger;
		throw new Error();
	}

	try {
		const doc = await database.get(id);
		const result = await database.put({ _id: doc._id, _rev: doc._rev, ...item });
		return result.ok;
	}
	catch (err) {
		console.error(err);
	}

	return false;
}
