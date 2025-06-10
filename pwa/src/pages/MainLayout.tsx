import { useState } from "react";
import { BanknoteIcon, LineChartIcon, TagIcon } from "lucide-react";
import FinancesPage from "./finances";
import CategoriesPage from "./Categories";
import HistoryPage from "./History";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const tabItems = [
	{ content: <FinancesPage />, key: "finances", title: "Transacciones", icon: <BanknoteIcon /> },
	{ content: <CategoriesPage />, key: "categories", title: "Categorías", icon: <TagIcon /> },
	{ content: <HistoryPage />, key: "history", title: "Historial", icon: <LineChartIcon /> },
];

export default function MainLayout() {
	const [activeTab, setActiveTab] = useState("finances");

	return (
		<Tabs className="column flex h-full w-full" defaultValue="finances" style={{ flexFlow: "column", padding: "1em" }}>
			<div className="flex-1 mb-[1em]">
				{tabItems.map(item => (
					<TabsContent key={item.key} value={item.key} style={{ height: "100%" }}>
						{item.content}
					</TabsContent>
				))}
			</div>
			<TabsList className="flex gap-x-[1em] self-center min-h-[4em]">
				{tabItems.map(item => (
					<TabsTrigger key={item.key} className="flex flex-col" value={item.key}>
						{item.icon}
						{item.title}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
