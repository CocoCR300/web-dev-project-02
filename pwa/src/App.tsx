import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./pages/MainLayout";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider, useAuth } from "./services/AuthContext";

import "./App.css";

function AppRoutes()
{
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


function App()
{
	return (
		<ThemeProvider>
			<AuthProvider>
				<Router>
					<AppRoutes />
				</Router>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
