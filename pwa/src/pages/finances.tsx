import { useEffect, useState } from "react";
import TransactionCard from "../components/transaction-card";
import type { Transaction } from "../typedef";
import ListView from "../components/list-view";
import { transactions } from "../services/finances";
import { Button } from "../components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../components/ui/drawer";
import { cn } from "../lib/utils";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface TransactionDrawerData
{
	open: boolean;
}

function TransactionDrawer(data: TransactionDrawerData)
{
	const [amount, setAmount] = useState(0);
	const [open, setOpen] = useState(data.open);

	function changeAmount(newAmount: number) {
		setAmount(current => current + newAmount);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger className="self-center flex gap-2 text-center">
				<PlusIcon/>
				Agregar
			</DrawerTrigger>
			<DrawerContent>
				<div className="mx-auto w-full max-w-sm">
					<DrawerHeader>
						<DrawerTitle>Nueva transacción</DrawerTitle>
						<DrawerDescription>Agrega tus ingresos o gastos</DrawerDescription>
					</DrawerHeader>
					<div className="gap-6 grid items-start pb-4">
						<div className="flex items-center justify-center space-x-2">
							<Button
								disabled={ amount == 1_000_000 }
								className="h-8 w-8 shrink-0 rounded-full"
								size="icon"
								onClick={() => changeAmount(-10)}
								type="button"
								variant="outline">
								<MinusIcon />
								<span className="sr-only">Decrease</span>
							</Button>
							<div className="items-center flex flex-1 justify-center">
								<div className="text-muted-foreground text-[2rem]">
									$
								</div>
								<div className="text-7xl font-bold tracking-tighter">
									{amount}
								</div>
							</div>
							<Button
								className="h-8 w-8 shrink-0 rounded-full"
								disabled={ amount == 1_000_000 }
								onClick={() => changeAmount(10)}
								size="icon"
								variant="outline">
								<PlusIcon />
								<span className="sr-only">Increase</span>
							</Button>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description"/>
						</div>
						<Button type="submit"></Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

export default function FinancesPage()
{
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [items, setItems] = useState<Transaction[]>([]);

	useEffect(() => {
		getTransactions();
	}, []);

	async function getTransactions() {
		// Uncomment when needed
		//create("transactions", { amount: -100, category: "Shopping", date: new Date(), description: "Went to the mall again!" });
		//create("transactions", { amount: 1000, category: "Job", date: new Date().setFullYear(2000), description: "Another day of hard work" });

		const items = await transactions("", 0, 100);
		setItems(items);
	}

	return (
		<div className="flex flex-col gap-2 h-full">
			<ListView
				items={ items }
				itemTemplate={(_, item) => {
					return <TransactionCard transaction={ item } />
				}
			}>
			</ListView>
			<TransactionDrawer open={drawerOpen}/>
		</div>
	);
}
