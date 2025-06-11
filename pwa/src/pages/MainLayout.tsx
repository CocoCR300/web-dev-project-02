import { BanknoteIcon, DownloadIcon, LineChartIcon, LogOutIcon, TagIcon } from "lucide-react";
import FinancesPage from "./finances";
import CategoriesPage from "./Categories";
import HistoryPage from "./History";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useAuth } from "../services/AuthContext";
import { useEffect, useRef, useState } from "react";

const tabItems = [
	{ content: <FinancesPage />, key: "finances", title: "Transacciones", icon: <BanknoteIcon /> },
	{ content: <CategoriesPage />, key: "categories", title: "Categorías", icon: <TagIcon /> },
	{ content: <HistoryPage />, key: "history", title: "Historial", icon: <LineChartIcon /> },
];

export default function MainLayout()
{
	const auth = useAuth();
	const [installPrompt, setInstallPrompt] = useState<any>(null);

	useEffect(() => {
			window.addEventListener("beforeinstallprompt", beforeInstallPrompt);

			return () => window.removeEventListener("beforeinstallprompt", beforeInstallPrompt);
	}, []);

	function beforeInstallPrompt(event: any) {
		event.preventDefault();
		setInstallPrompt(event);
	}

	function install() {
		if (installPrompt != null) {
			installPrompt.prompt();
			setInstallPrompt(null);
		}
	}

	return (
		<Tabs className="column flex h-full w-full" defaultValue="finances" style={{ flexFlow: "column", padding: "1em" }}>
			<div className="flex gap-2 justify-end mb-[1em]">
				<Button onClick={ _ => install() } variant="outline" hidden={installPrompt == null}>
					<DownloadIcon/>
					Instalar
				</Button>
				<Button onClick={ _ => auth.logout() } variant="outline">
					<LogOutIcon/>
					Cerrar sesión
				</Button>
			</div>
			<div className="flex-1 mb-[1em]">
				{tabItems.map(item => (
					<TabsContent key={item.key} value={item.key} style={{ height: "100%" }}>
						{item.content}
					</TabsContent>
				))}
			</div>
			<TabsList className="flex gap-x-[1em] self-center min-h-[4em]">
				{
					tabItems.map(item => (
						<TabsTrigger key={item.key} className="flex flex-col" value={item.key}>
							{item.icon}
							{item.title}
						</TabsTrigger>
					))
				}
			</TabsList>
		</Tabs>
	);
}
