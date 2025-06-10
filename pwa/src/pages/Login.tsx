import { useState, FormEvent } from "react";
import { UserIcon, LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import "./Login.css";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {login} = useAuth();



  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password })
      });

      if (!response.ok) {
        throw new Error("Usuario o contraseña inválidos");
      }

      const token = await response.json();
      login(token)
      navigate("/");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar sesión</h2>

        <div className="input-group">
          <UserIcon className="icon" size={20} />
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <LockIcon className="icon" size={20} />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Ingresar"}
        </button>

        <button
          type="button"
          className="register-button"
          onClick={() => navigate("/register")}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
