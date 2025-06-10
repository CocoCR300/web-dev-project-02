import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./pages/MainLayout"; 
import { ThemeProvider } from "./theme-provider";
import "./App.css";
import { AuthProvider, useAuth } from "./services/AuthContext";

function AppRoutes() {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <div>Cargando...</div>;
	}

	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route
				path="/"
				element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
			/>
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	);
}


function App() {
<<<<<<< Updated upstream
	
	const [activeTab, setActiveTab] = useState('finances')
	
	return (
		<ThemeProvider>
			<Tabs className="column flex h-full w-full" defaultValue={ tabItems[0].key } style={{
				flexFlow: "column",
				padding: "1em"
			}}>
				<div className="flex-1 mb-[1em]">
					{
						tabItems.map(item => (
							<TabsContent key={ item.key } value={item.key} style={{ height: "100%" }}>
								{ item.content }
							</TabsContent>
						))
					}
				</div>
				<TabsList className="flex gap-x-[1em] self-center min-h-[4em]">
					{
						tabItems.map(item => (
							<TabsTrigger className="flex flex-col" key={ item.key } value={item.key}>
								{ item.icon }
								{ item.title }
							</TabsTrigger>
						))
					}
				</TabsList>
			</Tabs>
		</ThemeProvider>
	)
=======
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
>>>>>>> Stashed changes
}

export default App;
