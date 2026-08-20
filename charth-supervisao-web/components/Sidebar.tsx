"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { podeCriarAvaliacao } from "../lib/auth";
import type { Usuario } from "../lib/types";

export default function Sidebar({ usuario }: { usuario: Usuario }) {
  return (
    <nav
      className="charth-sidebar"
      style={{
        width: 220,
        padding: "1rem",
        borderRight: "1px solid #e5e5e5",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <strong>{usuario.nome}</strong>
      <span style={{ fontSize: "0.8rem", color: "#666" }}>{usuario.perfil}</span>

      <Link href="/dashboard" className="nav-pill">Dashboard</Link>
      {podeCriarAvaliacao(usuario.perfil) && (
        <Link href="/avaliacao/nova" className="nav-pill">Nova avaliação</Link>
      )}
      <Link href="/historico" className="nav-pill">Histórico</Link>
      <Link href="/planos-de-acao" className="nav-pill">Planos de ação</Link>
      <Link href="/configuracoes" className="nav-pill">Configurações</Link>

      {/* Bonificação NÃO existe como página no app original (confirmado
          em app.py: as 5 páginas reais são Dashboard/Nova Avaliação/
          Histórico/Planos de Ação/Configurações). Mantida aqui como
          extra, já que o cálculo é real e útil — mas é uma adição do
          rebuild, não uma página do sistema original. */}
      {podeCriarAvaliacao(usuario.perfil) && (
        <Link href="/bonificacao" className="nav-pill nav-pill-extra">
          Bonificação (extra, fora do app original)
        </Link>
      )}

      <button onClick={() => signOut(auth)} className="nav-pill" style={{ marginTop: "auto", border: "none" }}>
        Sair
      </button>
    </nav>
  );
}
