import { useEffect, useState } from "react";
import TransactionCard from "../components/transaction-card";
import type { Transaction } from "../typedef";
import ListView from "../components/list-view";
import { saveTransaction, transactions } from "../services/finances";
import { Button } from "../components/ui/button";
import { Loader, MinusIcon, PlusIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../components/ui/drawer";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface TransactionDrawerData
{
	index: number | null;
	open: boolean;
	save: (index: number | null, transaction: Transaction) => Promise<boolean>;
	setOpen: (open: boolean) => void;
	transaction: Transaction | null;
}

function TransactionDrawer(data: TransactionDrawerData)
{
	const { index, open, save, setOpen, transaction } = data;
	const transactionId = transaction?._id || null;

	const [amount, setAmount] = useState<number>(0);
	const [category, setCategory] = useState<string>("");
	const [date, setDate] = useState<Date>(new Date());
	const [description, setDescription] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	function changeAmount(newAmount: number) {
		setAmount(current => current + newAmount);
	}

	async function saveTransaction() {
		const newTransaction: Transaction = {
			_id: transactionId, amount, category, description, date
		};

		setLoading(true);
		await new Promise((resolve, _) => setTimeout(resolve, 5000));
		await save(index, newTransaction);
		setLoading(false);
		setOpen(false);
	}

	useEffect(() => {
		if (transaction) {
			setAmount(transaction.amount);
			setDescription(transaction.description);
		}
		else {
			setAmount(0);
			setDescription("");
		}
	}, [open, transaction]);

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger className="self-center flex gap-2 text-center">
				<PlusIcon/>
				Agregar
			</DrawerTrigger>
			<DrawerContent>
				<div className="mx-auto w-full max-w-sm">
					{loading && (<Loader className="animate-spin"/>)}
					<DrawerHeader>
						<DrawerTitle>Nueva transacción</DrawerTitle>
						<DrawerDescription>Agrega tus ingresos o gastos</DrawerDescription>
					</DrawerHeader>
					<div className="gap-6 grid items-start pb-4">
						<div className="flex items-center justify-center space-x-2">
							<Button
								disabled={ amount == 10_000 }
								className="h-8 w-8 shrink-0 rounded-full"
								size="icon"
								onClick={() => changeAmount(-10)}
								type="button"
								variant="outline">
								<MinusIcon />
								<span className="sr-only">Decrease</span>
							</Button>
							<div className="flex flex-1 gap-2 items-center justify-center">
								<div className="text-muted-foreground text-[2rem]">
									$
								</div>
								<div className="text-7xl font-bold tracking-tighter">
									{amount}
								</div>
							</div>
							<Button
								className="h-8 w-8 shrink-0 rounded-full"
								disabled={ amount == 10_000 }
								onClick={() => changeAmount(10)}
								size="icon"
								variant="outline">
								<PlusIcon />
								<span className="sr-only">Increase</span>
							</Button>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description" onChange={ event => setDescription(event.target.value) } value={ description } />
						</div>
						<Button onClick={ saveTransaction }>Guardar</Button>
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
	const [selectedTransactionIndex, selectTransactionIndex] = useState<number | null>(null);

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

	async function save(index: number | null, newTransaction: Transaction): Promise<boolean> {
		const success = await saveTransaction(newTransaction);
		let newItems;
		if (index) {
			newItems = [...items.slice(0, index), newTransaction, ...items.slice(index + 1)];
		}
		else {
			newItems = [...items, newTransaction];
		}

		setItems(newItems);

		return success;
	}

	function cardClicked(index: number) {
		selectTransactionIndex(index);
		setDrawerOpen(true);
	}

	function toggleDrawer(open: boolean) {
		setDrawerOpen(open);
		if (!open) {
			selectTransactionIndex(null);
		}
	}

	const selectedTransaction = selectedTransactionIndex != null ? items[selectedTransactionIndex] : null;

	return (
		<div className="flex flex-col gap-2 h-full">
			<ListView
				items={ items }
				itemTemplate={(index, item) => {
					return <TransactionCard onClick={ () => cardClicked(index) } transaction={ item } />
				}
			}>
			</ListView>
			<TransactionDrawer index={ selectedTransactionIndex }open={ drawerOpen } setOpen={ toggleDrawer } transaction={ selectedTransaction } save={ save } />
		</div>
	);
}
