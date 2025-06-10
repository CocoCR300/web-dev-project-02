import { DEFAULT_CATEGORY, type Category, type Transaction } from "../typedef";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export interface TransactionCardData
{
	onClick?: () => void;
	transaction: Transaction;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
	dateStyle: "long",
	timeStyle: "short"
});

// Colors: 
// - Incomes: Light: oklch(72.3% 0.219 149.579), Dark: *missing*
// - Expenses: Light: *missing*, Dark: oklch(25.8% 0.092 26.042)
// Need 
export default function TransactionCard(data: TransactionCardData)
{
	const { onClick, transaction } = data;
	
	let category = transaction.category;
	if (category == null) {
		category = DEFAULT_CATEGORY;
	}

	return (
		<Card className="p-3 gap-4" onClick={ onClick }>
			<div className="border-b flex gap-2 ml-2 pb-2 scroll-m-20">
				<div className="text-muted-foreground text-[1.5rem]">
					$
				</div>
				<h2 className="text-3xl font-semibold tracking-tight">{ transaction.amount }</h2>
			</div>
			<Badge className="ml-2">{ category.name }</Badge>
			<p className="ml-2 text-muted-foreground">{ DATE_TIME_FORMAT.format(transaction.date) }</p>
			<p className="ml-2 text-muted-foreground">{ transaction.description }</p>
		</Card>
	);
}
