export interface Transaction
{
	_id: string | null;
	amount: number;
	category: any;
	date: Date;
	description: string;
}

