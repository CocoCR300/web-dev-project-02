export interface Transaction
{
	_id: string | null;
	categoryId: string;
	amount: number;
	date: Date;
	description: string;
}

export interface Category
{
	_id?: string;
	name: string;
}

export const DEFAULT_CATEGORY: Category = {
	_id: "default",
	name: "Sin categoría"
};
