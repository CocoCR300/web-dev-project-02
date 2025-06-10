export interface Transaction
{
	_id: number | null;
	category_id: number;
	amount: number;
	date: Date;
	description: string;
	category: Category | null;
}

export interface Category
{
	_id: number | null;
	id: number;
	name: string;
}

export const DEFAULT_CATEGORY: Category = {
	_id: 0,
	id: 0,
	name: "Sin categoría"
};
