import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import './App.css'
import { BanknoteIcon, Search, Settings } from 'lucide-react'
import { ThemeProvider } from './theme-provider';
import FinancesPage from './pages/finances';

const tabItems = [
	{
		content: <FinancesPage/>,
		key: "finances",
		title: "Finances",
		icon: <BanknoteIcon/>,
	},
	{
		content: "Hello, search!",
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
				<div style={{ flex: 1, marginBottom: "1em" }}>
					{
						tabItems.map(item => (
							<TabsContent value={item.key} style={{ height: "100%" }}>
								{ item.content }
							</TabsContent>
						))
					}
				</div>
				<TabsList style={{ columnGap: "0.5em", display: "flex", justifyContent: "center" }}>
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
