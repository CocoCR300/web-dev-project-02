import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserIcon, LockIcon } from "lucide-react";
import { API_URL } from "../globals";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	async function handleLogin(e: FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch(`${API_URL}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: username, password })
			});

			if (!response.ok) {
				throw new Error("Usuario o contraseña inválidos");
			}

			const token = await response.json();
			login(token);
			navigate("/");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="text-center text-xl font-bold text-white">
					Iniciar sesión
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-1">
							<Label htmlFor="username">Usuario</Label>
							<div className="flex items-center gap-2 bg-zinc-800 rounded-md px-3 py-2">
								<UserIcon size={18} className="text-zinc-400" />
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white w-full"
									placeholder="Ingresa tu usuario"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<Label htmlFor="password">Contraseña</Label>
							<div className="flex items-center gap-2 bg-zinc-800 rounded-md px-3 py-2">
								<LockIcon size={18} className="text-zinc-400" />
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white w-full"
									placeholder="Ingresa tu contraseña"
								/>
							</div>
						</div>

						{error && <p className="text-red-500 text-sm text-center">{error}</p>}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Cargando..." : "Ingresar"}
						</Button>

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => navigate("/register")}
						>
							Registrarse
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
