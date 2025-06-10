import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
			setError("llena todos los campos.");
			setLoading(false);
			return;
		}

		if (password.length < 4) {
			setError("contraseña de 4 caracteres minimo.");
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
			input: {
				full_name: fullName,
				name,
				password
			}
		};

		try {
			const response = await fetch("http://localhost:4000/graphql", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query, variables })
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
		<div className="register-container">
			<div className="register-box">
				<h1 className="register-title">Registro</h1>
				<form onSubmit={handleSubmit} className="register-form">
					<div className="form-group">
						<label>Nombre completo</label>
						<input
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
						/>
					</div>
					<div className="form-group">
						<label>Nombre de usuario</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="form-group">
						<label>Contraseña</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					{error && <p className="error-message">{error}</p>}
					{success && <p className="success-message">{success}</p>}
					<button type="submit" className="register-button" disabled={loading}>
						{loading ? "Registrando..." : "Registrarse"}
					</button>
                    <button
                        type="button"
                        className="register-button"
                        onClick={() => navigate("/Login")}
                    >
                    Iniciar sesion
                    </button>
				</form>
			</div>
		</div>
	);
}
