import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

type Sort = (string | { [propName: string]: "asc" | "desc" })[];

PouchDB.plugin(PouchDBFind);

export async function get(database: PouchDB.Database, sortBy: string, id?: string, offset?: number, limit?: number): Promise<any[]>
{
	try {
		// https://pouchdb.com/guides/mango-queries.html#query-language
		// "Note that we are specifying that ... must be greater than or equal to null, which is a workaround for the fact that the Mango query language requires us to have a selector."
		const selector: PouchDB.Find.Selector = { [sortBy]: { $gte: null } };
		if (id) {
			selector._id = id;
		}
		const sort: Sort = [ { [sortBy]: "desc" } ];
		const result = await database.find({ selector, sort, skip: offset, limit });
		return result.docs;
	}
	catch (err) {
		console.error(err);
		return [];
	}
}

export async function create(database: PouchDB.Database, item: any): Promise<string>
{
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

export async function remove(database: PouchDB.Database, id: string): Promise<boolean>
{
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


export async function update(database: PouchDB.Database, id: string, item: any): Promise<boolean>
{
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
