import { useEffect, useState } from "react";
import TransactionCard from "../components/transaction-card";
import type { Transaction, Category } from "../typedef";
import ListView from "../components/list-view";
import { category as fetchCategories, saveCategory } from "../services/Categories";
import { deleteTransaction, saveTransaction, transactions } from "../services/finances";
import { Button } from "../components/ui/button";
import { Calendar, ChevronDownIcon, LoaderIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../components/ui/drawer";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Input } from "../components/ui/input";

interface TransactionDrawerData
{
	index: number | null;
	open: boolean;
	remove: (index: number) => Promise<boolean>;
	save: (index: number | null, transaction: Transaction) => Promise<boolean>;
	setOpen: (open: boolean) => void;
	transaction: Transaction | null;
}

function TransactionDrawer(data: TransactionDrawerData)
{
	const { index, open, remove, save, setOpen, transaction } = data;
	const transactionId = transaction?._id || null;

	const [amount, setAmount] = useState<number>(0);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [category, setCategory] = useState<string>("");
	const [date, setDate] = useState<Date>(new Date());
	const [description, setDescription] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	function changeAmount(newAmount: number) {
		setAmount(current => current + newAmount);
	}

	async function saveTransaction() {
		let assignedCategory = category;

		if (!assignedCategory) {
		const existing = categoryList.find(cat => cat.name === "Sin categoría");

		if (!existing) {
			const created = await saveCategory({
				_id: "no-category",
				name: "Sin categoría",
				type: "category"
			});
			if (created) {
				const updated = await fetchCategories("", 0, 100);
				setCategoryList(updated);
				}
				assignedCategory = "Sin categoría";
			} else {
				assignedCategory = existing.name;
			}
		}

		const newTransaction: Transaction = {
			_id: transactionId, amount, category: assignedCategory, description, date, type: "transaction"
		};
		
		setLoading(true);
		await new Promise((resolve, _) => setTimeout(resolve, 2000));
		const saved = await save(index, newTransaction);
		if (saved) {
			setLoading(false);
			setOpen(false);
		}
	}
	
	async function deleteTransaction() {
		setLoading(true);
		await new Promise((resolve, _) => setTimeout(resolve, 2000));
		const removed = await remove(index!);
		if (removed) {
			setLoading(false);
			setOpen(false);
		}
	}
	
	function openChange(open: boolean) {
		if (loading) {
			return;
		}
		
		setOpen(open);
	}
	
	useEffect(() => {
		if (transaction) {
			setAmount(transaction.amount);
			setDescription(transaction.description);
			setCategory(transaction.category)
		}
		else {
			setAmount(0);
			setDescription("");
			setCategory("")
		}
		
		(async()=>{
			const result = await fetchCategories("",0,100);
			setCategoryList(result)
		})();
		
	}, [open, transaction]);
	
	return (
		<Drawer open={open} onOpenChange={ openChange }>
			<DrawerTrigger className="self-center flex gap-2 text-center">
				<PlusIcon/>
				Agregar
			</DrawerTrigger>
			<DrawerContent>
				{ loading &&
					<div className="absolute bg-[rgba(0,0,0,75%)] h-full w-full">
						<LoaderIcon className="absolute animate-spin left-[50%] top-50"/>
					</div>
				}
				<div className="mx-auto max-w-sm w-full">
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
						<div className="gap-3 grid">
							<Label>
								Fecha y hora
							</Label>
							<div className="flex gap-4">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											id="date"
											className="w-48 justify-between font-normal">
											{date ? date.toLocaleDateString() : "Select date"}
											<ChevronDownIcon />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto overflow-hidden p-0" align="start">
										<Calendar
											captionLayout="dropdown"
											mode="single"
											selected={date}
											onSelect={ event => {
												setDate(event)
											}}/>
									</PopoverContent>
								</Popover>
								<Input
									defaultValue="10:30:00"
									type="time"
									id="time"
									step="1"
									className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"/>
							</div>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="category">Categoría</Label>
								<select
									id="category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="bg-background border border-input px-3 py-2 rounded-md text-sm"
									>
								<option value="">Selecciona una categoría</option>
								{categoryList.map((cat) => (
								<option key={cat._id} value={cat.name}>
								{cat.name}
							</option>
							))}
								</select>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description" onChange={ event => setDescription(event.target.value) } value={ description } />
						</div>
						<div className="grid gap-3">
							<Button onClick={ saveTransaction }>Guardar</Button>
							{ index != null && <Button className="bg-[red!important] text-white" onClick={ deleteTransaction }>Eliminar</Button> }
						</div>
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

	async function removeItem(index: number): Promise<boolean> {
		const id = items[index]._id!;
		const success = await deleteTransaction(id);
		if (success) {
			const newItems = [...items];
			newItems.splice(index, 1);
			setItems(newItems);
		}

		return success;
	}

	async function saveItem(index: number | null, newTransaction: Transaction): Promise<boolean> {
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
			<TransactionDrawer remove={ removeItem } index={ selectedTransactionIndex }open={ drawerOpen } setOpen={ toggleDrawer } transaction={ selectedTransaction } save={ saveItem } />
		</div>
	);
}
