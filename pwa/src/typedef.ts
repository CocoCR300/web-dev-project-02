export interface Transaction
{
	_id: string | null;
	category: string;
	amount: number;
	date: Date;
	description: string;
	type: "transaction"
}

export interface Category{
	_id?: string;
	name: string;
	type: "category";
}