import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import './App.css'
import { Home, Search, Settings } from 'lucide-react'
import { ThemeProvider } from './theme-provider';

const tabItems = [
	{
		content: "Hello, world!",
		key: "home",
		title: "Home",
		url: "#",
		icon: <Home/>,
	},
	{
		content: "Hello, search!",
		key: "search",
		title: "Search",
		url: "#",
		icon: <Search/>,
	},
	{
		content: "Hello, settings!",
		key: "settings",
		title: "Settings",
		url: "#",
		icon: <Settings/>,
	},
];

function App() {
	return (
		<ThemeProvider>
			<Tabs defaultValue="account" style={{
				display: "flex",
				flexFlow: "column",
				height: "100%",
				padding: "1em",
				width: "100%"
			}}>
				<div style={{ flex: 1, marginBottom: "0.5em" }}>
					{
						tabItems.map(item => (
							<TabsContent value={item.key}>
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
