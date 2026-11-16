"use client";

import { useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { listarAvaliacoes } from "../../lib/firestore-queries";
import type { Usuario } from "../../lib/types";

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute perfisPermitidos={["admin", "supervisora"]}>
      {(usuario) => <Conteudo usuario={usuario} />}
    </ProtectedRoute>
  );
}

function Conteudo({ usuario }: { usuario: Usuario }) {
  const [exportando, setExportando] = useState(false);

  async function handleExportarAvaliacoes() {
    setExportando(true);
    try {
      const avaliacoes = await listarAvaliacoes(usuario);
      const blob = new Blob([JSON.stringify(avaliacoes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avaliacoes_charth_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="layout-autenticado">
      <Sidebar usuario={usuario} />
      <main className="conteudo">
        <Header title="Configurações" />
        <p style={{ background: "#e7f3ff", padding: "0.75rem", borderRadius: 6 }}>
          As principais regras configuráveis estão em <code>lib/formConfig.ts</code>: pesos,
          lojas, perfis e permissão das gestoras.
        </p>

        <h2>Acesso e senhas</h2>
        <p style={{ color: "#666" }}>
          O acesso a este app é feito pelo Hub da Charth. A liberação de pessoas e a troca de
          senha são gerenciadas lá, não aqui.
        </p>

        <h2 style={{ marginTop: "2rem" }}>Backup / Exportação</h2>
        <p style={{ color: "#666" }}>
          O banco de dados hoje é o Firestore (Firebase) — sem um arquivo único pra copiar como
          num banco tradicional. A forma de backup disponível é exportar as avaliações que você
          tem acesso em JSON:
        </p>
        <button disabled={exportando} onClick={handleExportarAvaliacoes}>
          {exportando ? "Exportando..." : "Exportar minhas avaliações (JSON)"}
        </button>

        <h2 style={{ marginTop: "2rem" }}>Pontos importantes</h2>
        <ul>
          <li>Gestoras não conseguem criar avaliações. Elas acessam Dashboard, Histórico e Planos de Ação.</li>
          <li>O banco de dados é o Firestore (Firebase).</li>
        </ul>
      </main>
    </div>
  );
}
