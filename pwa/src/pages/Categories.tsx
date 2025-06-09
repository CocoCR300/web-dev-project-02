import { useEffect, useState } from "react";
import type { Transaction, Category } from "../typedef";
import { category, saveCategory, deleteCategory } from "../services/Categories";
import { transactions, deleteTransaction } from "../services/finances";
import { Button } from "../components/ui/button";

export default function CategoriesPage() {
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [categoryName, setCategoryName] = useState("");
	const [transactionList, setTransactionList] = useState<Transaction[]>([]);

	useEffect(() => {
		loadCategories();
	}, []);

	useEffect(() => {
		loadTransactions();
	}, [selectedCategory]);

	async function loadCategories() {
		let cats = await category("", 0, 100);
		if (!cats.some(c => c.name === "Sin categoría")) {
			await saveCategory({ name: "Sin categoría", type: "category", _id: "no-category" });
			cats = await category("", 0, 100);
		}
		setCategoryList(cats);
	}

	async function loadTransactions() {
		const all = await transactions("", 0, 100);
		const filtered = selectedCategory
			? all
					.filter(t => (t.category || "Sin categoría") === selectedCategory)
					.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			: [];
		setTransactionList(filtered);
	}

	async function handleAddCategory() {
		if (!categoryName.trim()) return;
		await saveCategory({ name: categoryName.trim(), type: "category" });
		setCategoryName("");
		loadCategories();
	}

	async function handleDeleteCategory(id: string) {
	const cat = categoryList.find(c => c._id === id);
	if (!cat) return;

	const all = await transactions("", 0, 100);
	const related = all.filter(t => (t.category || "Sin categoría") === cat.name);

	if (related.length > 0) {
		const confirmDelete = confirm(
			`La categoría "${cat.name}" tiene ${related.length} transacciones. ¿Deseas eliminarla junto con todas sus transacciones?`
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
		if (selectedCategory === cat.name) {
			setSelectedCategory(null);
			setTransactionList([]);
		}
		loadCategories();
		loadTransactions(); 
	}
}

	return (
	<div className="p-6 space-y-6 max-w-4xl mx-auto">
		<div className="text-center">
			<h1 className="text-2xl font-bold mb-1">Categorías</h1>
		</div>

		<div className="flex gap-2">
			<input
				className="flex-1 border border-input rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
				placeholder="Nueva categoría"
				value={categoryName}
				onChange={e => setCategoryName(e.target.value)}
			/>
			<Button onClick={handleAddCategory}>Agregar</Button>
		</div>

		<div className="flex flex-wrap gap-3">
			{categoryList.map(cat => (
				<div key={cat._id} className="flex items-center gap-1">
					<Button
						variant={selectedCategory === cat.name ? "default" : "secondary"}
						className="rounded-full px-4 py-1"
						onClick={() => setSelectedCategory(cat.name)}
					>
						{cat.name}
					</Button>
					{cat._id !== "no-category" && (
						<Button
							variant="destructive"
							size="icon"
							className="rounded-full px-2 py-1 h-auto"
							onClick={() => handleDeleteCategory(cat._id!)}
							title="Eliminar categoría"
						>
							×
						</Button>
					)}
				</div>
			))}
		</div>
		{selectedCategory && (
			<div className="mt-6">
				<h2 className="text-xl font-semibold mb-4 text-center">
					Transacciones en <span className="text-primary">"{selectedCategory}"</span>
				</h2>

				{transactionList.length > 0 ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{transactionList.map(tx => (
							<div
								key={tx._id}
								className="bg-gray border rounded-xl shadow-sm p-4 space-y-1"
							>
								<h3 className="font-medium text-lg">{tx.description}</h3>
								<p className="text-muted-foreground text-sm">
									Monto: <span className="font-semibold">${tx.amount}</span>
								</p>
								<p className="text-muted-foreground text-sm">
									Fecha: {new Date(tx.date).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-center text-muted-foreground">
						No hay transacciones para esta categoría.
					</p>
				)}
			</div>
		)}
	</div>
);

}
