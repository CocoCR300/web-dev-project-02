import { useEffect, useState } from "react";
import TransactionCard from "../components/transaction-card";
import type { Transaction } from "../typedef";
import ListView from "../components/list-view";
import { create, get } from "../database";

export default function FinancesPage()
{
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	useEffect(() => {
		async function getTransactions() {
			// Uncomment when needed
			//create("transactions", { amount: -100, category: "Shopping", date: new Date(), description: "Went to the mall again!" });
			//create("transactions", { amount: 1000, category: "Job", date: new Date().setFullYear(2000), description: "Another day of hard work" });

			const transactions = await get<Transaction>("transactions", "date", undefined, 0, 100);
			transactions.forEach(t => t.date = new Date((t.date as any) as string));
			setTransactions(transactions);
		}

		getTransactions();
	}, []);

	return (
		<div className="h-full">
			<ListView
				items={ transactions }
				itemTemplate={(_, item) => {
					return <TransactionCard transaction={ item } />
				}
			}>
			</ListView>
		</div>
	);
}
