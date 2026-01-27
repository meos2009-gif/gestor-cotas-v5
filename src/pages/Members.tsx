import { useEffect, useState } from "react";
import { getMembers, addMember } from "../services/members";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await addMember({ name, email, phone });
      setName("");
      setEmail("");
      setPhone("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Sócios</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          className="border p-2 w-full"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Adicionar Sócio
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Nome</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Telefone</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td className="border p-2">{m.name}</td>
              <td className="border p-2">{m.email}</td>
              <td className="border p-2">{m.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
