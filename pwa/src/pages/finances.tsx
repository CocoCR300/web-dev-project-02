import { useState } from "react";
import { Virtuoso } from "react-virtuoso";
import ListItemWrapper from "../components/list-item-wrapper";
import TransactionCard from "../components/transaction-card";
import type { Transaction } from "../typedef";

export default function FinancesPage()
{
	const [transactions, setTransactions] = useState<Transaction[]>([
		{ amount: -100, category: "Shopping", date: new Date(), description: "Went to the mall again!" },
		{ amount: 1000, category: "Job", date: new Date(), description: "Another day of hard work" },
		{ amount: 50, category: "Gift", date: new Date(), description: "Gift from granny" },
		{ amount: -500, category: "Family", date: new Date(), description: "Get-together next Sunday" },
	]);

	return (
		<div className="h-full">
			<Virtuoso
				components={{ Item: ListItemWrapper }}
				totalCount={ transactions.length }
				itemContent={ (index) => {
					const transaction = transactions[index];
					return <TransactionCard key={ index } transaction={ transaction } />
				}
			}>
			</Virtuoso>
		</div>
	);
}
