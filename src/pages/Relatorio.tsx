return (
  <div className="p-6">
    <h1 className="text-xl font-bold mb-4">Relatório de Pagamentos (versão nova)</h1>

    {error && <div className="text-red-600 mb-2">{error}</div>}
    {success && <div className="text-green-600 mb-2">{success}</div>}

    <button
      onClick={() => setShowReport(!showReport)}
      className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
    >
      {showReport ? "Esconder Relatório" : "Visualizar Relatório"}
    </button>

    <div className="mb-4 space-y-2">
      <label className="block font-semibold">Importar Excel:</label>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="border border-gray-600 p-2 bg-gray-800 text-white rounded w-full cursor-pointer"
      />

      <label className="block font-semibold mt-4">Ano:</label>
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="border p-2 bg-bg text-text rounded appearance-none"
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const y = new Date().getFullYear() - i;
          return (
            <option key={y} value={y}>
              {y}
            </option>
          );
        })}
      </select>
    </div>

    {showReport && (
      <div className="overflow-x-auto rounded border border-gray-700 mt-6">
        <table className="min-w-[900px] w-full text-center text-xs leading-tight">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-1 text-left">Sócio</th>
              {[
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                "Jul", "Ago", "Set", "Out", "Nov", "Dez",
              ].map((m, i) => (
                <th key={i} className="border p-1">
                  {m}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="border p-1 text-left">{member.name}</td>
                {Array.from({ length: 12 }).map((_, monthIndex) => (
                  <td key={monthIndex} className="border p-1">
                    {hasPayment(member.id, monthIndex + 1) ? "✔" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
