import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: any) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/login");
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Criar Conta</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="email"
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Criar Conta
        </button>
      </form>

      <button
        onClick={() => navigate("/login")}
        className="mt-4 text-blue-600 underline"
      >
        Já tenho conta
      </button>
    </div>
  );
}
