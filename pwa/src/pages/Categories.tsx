import { useEffect, useState, type ReactNode } from "react";
import { type Transaction, type Category, DEFAULT_CATEGORY } from "../typedef";
import { category, saveCategory, deleteCategory } from "../services/Categories";
import { transactions, deleteTransaction } from "../services/finances";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { XIcon } from "lucide-react";
import { VirtuosoGrid } from "react-virtuoso";

export default function CategoriesPage() {
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
	const [categoryName, setCategoryName] = useState("");
	const [transactionList, setTransactionList] = useState<Transaction[]>([]);

	useEffect(() => {
		loadCategories();
	}, []);

	useEffect(() => {
		loadTransactions();
	}, [selectedCategory]);

	async function loadCategories() {
		let categories = await category();
		categories.push(DEFAULT_CATEGORY);
		categories.sort((c0, c1) => c0.name.localeCompare(c1.name));
		setCategoryList(categories);
	}

	async function loadTransactions() {
		const all = await transactions("", 0, 100);
		let filtered: Transaction[] = [];
		if (selectedCategory) {
			filtered = all
				.filter(t => t.category!._id == selectedCategory._id)
				.sort((a, b) => b.date.getTime() - a.date.getTime());
		}
		setTransactionList(filtered);
	}

	async function handleAddCategory() {
		if (!categoryName.trim()) {
			return;
		}

		await saveCategory({ _id: null, name: categoryName.trim() });
		setCategoryName("");
		loadCategories();
	}

	async function handleDeleteCategory(id: number) {
		const cat = categoryList.find(c => c._id === id);
		if (!cat) {
			return;
		}

		const all = await transactions("", 0, 100);
		const related = all.filter(t => t.category!._id == cat._id!);

		if (related.length > 0) {
			const confirmDelete = confirm(
				`La categoría "${cat.name}" tiene ${related.length} transacciones. ¿Desea eliminarla junto con todas sus transacciones?`
			);
			if (!confirmDelete) return;

			for (const tx of related) {
				if (tx._id) {
					await deleteTransaction(tx._id);
				}
			}
		}

		const success = await deleteCategory(id);
		if (success) {
			if (selectedCategory != null && selectedCategory._id === cat._id) {
				setSelectedCategory(null);
				setTransactionList([]);
			}
			loadCategories();
			loadTransactions(); 
		}
	}

	let transactionsView: ReactNode;
	if (selectedCategory) {
		let transactionListView;
		if (transactionList.length == 0) {
			transactionListView = (
				<p className="text-center text-muted-foreground">
					No hay transacciones para esta categoría.
				</p>
			);
		}
		else {
			transactionListView = (
				<VirtuosoGrid
					listClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pl-4 pr-4"
					totalCount={ transactionList.length }
					itemContent={ index => {
						const transaction = transactionList[index];
						return (
							<div
								key={ transaction._id }
								className="bg-gray border rounded-xl shadow-sm p-4 space-y-1">
								<h3 className="font-medium text-lg">{transaction.description}</h3>
								<p className="text-muted-foreground text-sm">
									Monto: <span className="font-semibold">${transaction.amount}</span>
								</p>
								<p className="text-muted-foreground text-sm">
									Fecha: {transaction.date.toLocaleDateString()}
								</p>
							</div>
						);
					}}/>
			);
		}

		transactionsView = (
			<div className="flex flex-1 flex-col h-full mt-6">
				<h2 className="text-xl font-semibold mb-4 text-center">
					Transacciones en "{ selectedCategory.name }"
				</h2>

				<div className="flex-1 pb-4">
					{ transactionListView }
				</div>
			</div>
		);
	}
	else {
		transactionsView = (
			<div className="flex h-full items-center justify-center">
				<span className="text-muted-foreground text-center">Seleccione una categoría</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full p-1 space-y-6 max-w-4xl mx-auto">
			<div className="flex-1">
				{ transactionsView }
			</div>
			<div className="flex flex-wrap gap-3 max-h-[6em] overflow-scroll">
				{categoryList.map(category => (
					<div key={category._id} className="flex items-center gap-1">
					<Badge className="flex gap-2 p-0 rounded-full" variant="secondary">
						<Button
							variant={selectedCategory?._id == category._id ? "default" : "outline"}
							className="rounded-full px-4 py-1"
							onClick={() => setSelectedCategory(category)}>
							{category.name}
						</Button>
						{
							category._id != DEFAULT_CATEGORY._id && (
							<Button
								variant="destructive"
								size="icon"
								className="rounded-full px-2 py-1"
								onClick={() => handleDeleteCategory(category._id!)}
								title="Eliminar categoría">
								<XIcon/>
							</Button>
						)}
						</Badge>
					</div>
				))}
			</div>
			<div className="flex gap-2">
				<input
					className="flex-1 border border-input rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="Nueva categoría"
					value={categoryName}
					onChange={e => setCategoryName(e.target.value)}
				/>
				<Button onClick={handleAddCategory} variant="outline">Agregar</Button>
			</div>

		</div>
	);
}
