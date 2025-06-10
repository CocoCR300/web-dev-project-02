import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Register() {
	const [fullName, setFullName] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		if (!fullName || !name || !password) {
			setError("Llena todos los campos.");
			setLoading(false);
			return;
		}

		if (password.length < 4) {
			setError("Contraseña de 4 caracteres mínimo.");
			setLoading(false);
			return;
		}

		const query = `
			mutation Register($input: CreateUserInput!) {
				createUser(input: $input) {
					id
					name
					full_name
				}
			}
		`;

		const variables = {
			input: { full_name: fullName, name, password },
		};

		try {
			const response = await fetch("http://localhost:4000/graphql", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, variables }),
			});

			const result = await response.json();

			if (result.errors) {
				setError(result.errors[0].message || "Error al registrar");
			} else {
				setSuccess("Registro exitoso. Redirigiendo...");
				setFullName("");
				setName("");
				setPassword("");
			}
		} catch (err) {
			setError("Error de red o servidor.");
			console.error(err);
		}

		setLoading(false);
	};

	return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center text-xl font-bold text-white">
        Registro
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Nombre completo</Label>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-md px-3 py-2">
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white w-full"
                placeholder="Tu nombre completo"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Nombre de usuario</Label>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-md px-3 py-2">
              <Input
                id="username"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white w-full"
                placeholder="Nombre de usuario"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-md px-3 py-2">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white w-full"
                placeholder="Contraseña"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);

}
