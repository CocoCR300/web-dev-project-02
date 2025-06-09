import { BanknoteIcon, Search, Settings } from 'lucide-react'
import { ThemeProvider } from './theme-provider';
import FinancesPage from './pages/finances';
import CategoriesPage from './pages/Categories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import './App.css'


const tabItems = [
	{
		content: <FinancesPage/>,
		key: "finances",
		title: "Finances",
		icon: <BanknoteIcon/>,
	},
	{
		content: <CategoriesPage/>,
		key: "search",
		title: "Search",
		icon: <Search/>,
	},
	{
		content: "Hello, settings!",
		key: "settings",
		title: "Settings",
		icon: <Settings/>,
	},
];

function App() {
	return (
		<ThemeProvider>
			<Tabs className="column flex h-full w-full" defaultValue="finances" style={{
				flexFlow: "column",
				padding: "1em"
			}}>
				<div className="flex-1 mb-[1em]">
					{
						tabItems.map(item => (
							<TabsContent value={item.key} style={{ height: "100%" }}>
								{ item.content }
							</TabsContent>
						))
					}
				</div>
				<TabsList className="flex gap-x-[1em] self-center">
					{
						tabItems.map(item => (
							<TabsTrigger value={item.key}>
								{ item.icon }
								{ item.title }
							</TabsTrigger>
						))
					}
				</TabsList>
			</Tabs>
		</ThemeProvider>
	)
}

export default App;
