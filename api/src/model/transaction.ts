import { Category } from "./category";

export interface Transaction
{
	id: number;
	amount: number;
	date: Date;
	description: string;
	user_id: number;
	category: Category | null;
}
