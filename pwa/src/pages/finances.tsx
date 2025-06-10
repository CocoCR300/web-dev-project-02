import { useEffect, useState } from "react";
import TransactionCard from "../components/transaction-card";
import { type Transaction, type Category, DEFAULT_CATEGORY } from "../typedef";
import ListView from "../components/list-view";
import { category as fetchCategories } from "../services/Categories";
import { deleteTransaction, saveTransaction, transactions } from "../services/finances";
import { Button } from "../components/ui/button";
import { ChevronDownIcon, LoaderIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../components/ui/drawer";
import { Calendar } from "../components/ui/calendar";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface TransactionDrawerData {
	index: number | null;
	open: boolean;
	remove: (index: number) => Promise<boolean>;
	save: (index: number | null, transaction: Transaction) => Promise<boolean>;
	setOpen: (open: boolean) => void;
	transaction: Transaction | null;
}

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
	hour: "2-digit",
	hour12: false,
	minute: "2-digit"
});

function TransactionDrawer(data: TransactionDrawerData) {
	const { index, open, remove, save, setOpen, transaction } = data;
	const transactionId = transaction?._id || null;

	const [amount, setAmount] = useState<number>(0);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [categoryId, setCategoryId] = useState<number>(DEFAULT_CATEGORY.id);
	const [date, setDate] = useState<Date>(new Date());
	const [description, setDescription] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	function changeAmount(newAmount: number) {
		setAmount(current => current + newAmount);
	}

	async function saveTransaction() {
		const newTransaction: Transaction = {
			_id: transactionId, amount, category_id: categoryId, description, date, category: null
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

	async function getCategories() {
		const categories = await fetchCategories();
		setCategoryList(categories);
	}

	function openChange(open: boolean) {
		if (loading) {
			return;
		}

		setOpen(open);
	}

	useEffect(() => {
		getCategories();

		if (transaction) {
			setAmount(transaction.amount);
			setDescription(transaction.description);
			setCategoryId(transaction.category?.id ?? DEFAULT_CATEGORY.id);
		}
		else {
			setAmount(0);
			setDescription("");
			setCategoryId(DEFAULT_CATEGORY.id)
		}
	}, [open, transaction]);

	return (
		<Drawer open={open} onOpenChange={openChange}>
			<DrawerTrigger asChild className="self-center">
				<Button variant="outline">
					<PlusIcon />
					Agregar
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				{loading &&
					<div className="absolute bg-[rgba(0,0,0,75%)] h-full w-full">
						<LoaderIcon className="absolute animate-spin left-[50%] top-50" />
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
								disabled={amount == 10_000}
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
								disabled={amount == 10_000}
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
											onSelect={event => {
												const date = event as Date;
												setDate(date)
											}} />
									</PopoverContent>
								</Popover>
								<Input
									className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									defaultValue={TIME_FORMAT.format(new Date())}
									id="time"
									step="1"
									type="time" />
							</div>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="category">Categoría</Label>
							<Select
								defaultValue={ DEFAULT_CATEGORY.id.toString() }
								value={ categoryId?.toString() }
								onValueChange={ value => setCategoryId(parseInt(value)) }>
								<SelectTrigger className="w-full">
									<SelectValue id="category" placeholder="Seleccione una categoría" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ DEFAULT_CATEGORY.id.toString() }>{ DEFAULT_CATEGORY.name }</SelectItem>
									{
										categoryList.map(cat => (
											<SelectItem value={ cat.id.toString() }>
												{cat.name}
											</SelectItem>
										))
									}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description" onChange={event => setDescription(event.target.value)} value={description} />
						</div>
						<div className="grid gap-3">
							<Button onClick={saveTransaction}>Guardar</Button>
							{index != null && <Button className="bg-[red!important] text-white" onClick={deleteTransaction}>Eliminar</Button>}
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

export default function FinancesPage() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [categories, setCategories] = useState<Map<number, Category>>(new Map());
	const [items, setItems] = useState<Transaction[]>([]);
	const [selectedTransactionIndex, selectTransactionIndex] = useState<number | null>(null);

	useEffect(() => {
		load();
	}, []);

	async function load() {
		const categories = await fetchCategories();
		const items = await transactions("", 0, 100);

		const categoriesMap = new Map<number, Category>();
		for (const category of categories) {
			categoriesMap.set(category.id, category);
		}

		setCategories(categoriesMap);
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
		const createdTransaction = await saveTransaction(newTransaction);
		if (createdTransaction == null) {
			window.alert("Ha ocurrido un error al crear la transacción");
			return false;
		}

		let newItems;
		if (index != null) {
			newItems = [...items.slice(0, index), createdTransaction, ...items.slice(index + 1)];
		}
		else {
			newItems = [...items, createdTransaction];
		}

		newItems.sort((t0, t1) => t1.date.getTime() - t0.date.getTime());

		setItems(newItems);

		return true;
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
				items={items}
				itemTemplate={(index, item) => {
					return <TransactionCard onClick={() => cardClicked(index)} transaction={item} />
				}
				}>
			</ListView>
			<TransactionDrawer remove={removeItem} index={selectedTransactionIndex} open={drawerOpen} setOpen={toggleDrawer} transaction={selectedTransaction} save={saveItem} />
		</div>
	);
}
