import { useState, FormEvent } from "react";
import { UserIcon, LockIcon } from "lucide-react";
import "./Login.css";

interface LoginFormState {
  username: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginFormState>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setError("");
    console.log("Iniciar sesión con:", form);
    //aca agrego la logica para iniciar sesion cuando sirva la vista :D

  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        <div className="input-group">
          <UserIcon className="icon" size={20} />
          <input
            type="text"
            placeholder="Usuario"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="input-group">
          <LockIcon className="icon" size={20} />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
