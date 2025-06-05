import type { Transaction } from "../typedef";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export interface TransactionCardData
{
	transaction: Transaction;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
	dateStyle: "long",
	timeStyle: "short"
});

export default function TransactionCard(data: TransactionCardData)
{
	const { transaction } = data;
	return (
		<Card className="p-3 gap-4" style={{ backgroundColor: "oklch(25.8% 0.092 26.042)" }}>
			<h2 className="scroll-m-20 border-b ml-2 pb-2 text-3xl font-semibold tracking-tight">{ transaction.amount.toFixed(2) }</h2>
			<Badge className="ml-2">{ transaction.category }</Badge>
			<p className="ml-2">{ DATE_TIME_FORMAT.format(transaction.date) }</p>
			<p className="ml-2">{ transaction.description }</p>
		</Card>
	);
}
