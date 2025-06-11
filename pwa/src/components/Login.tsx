import { useState } from "react";
import { API_URL } from "../globals";

import "./Login.css";

const Login = () => {
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		const response = await fetch(`${API_URL}/graphql`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, password }),
		});

		if (!response.ok) {
			throw new Error("Credenciales incorrectas")
		}
	};

	return (
		<div className="login-container">
			<div className="login-box">
				<h1 className="login-title">Inicio de Sesión</h1>
				<form onSubmit={handleSubmit} className="login-form">
					<div className="form-group">
						<label>Correo electrónico</label>
						<input
							type="Usuario"
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
					<button type="submit" className="login-button">
						Iniciar sesión
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
