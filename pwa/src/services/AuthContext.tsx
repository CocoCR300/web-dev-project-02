import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { API_URL } from "../globals";

interface AuthContextType {
	isAuthenticated: boolean;
	login: (token: string) => void;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) =>
{
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const verifyToken = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(`${API_URL}/graphql`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
					body: JSON.stringify({ query: `{ me { id name } }` }),
				});

				const result = await response.json();
				if (result.data?.me) {
					setIsAuthenticated(true);
				} else {
					localStorage.removeItem("token");
					setIsAuthenticated(false);
				}
			}
			catch (err: any) {
				if (err.message.startsWith("NetworkError")) {
					setIsAuthenticated(true);
				}
				setLoading(false);
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		verifyToken();
	}, []);

	const login = (token: string) => {
		localStorage.setItem("token", token);
		setIsAuthenticated(true);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth debe estar dentro de AuthProvider");

	return context;
};
