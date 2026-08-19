"use client";

import { useEffect, useState } from "react";
import { updatePassword, sendPasswordResetEmail } from "firebase/auth";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { auth } from "../../lib/firebase";
import { podeAdmin } from "../../lib/auth";
import { listarUsuarios, listarAvaliacoes } from "../../lib/firestore-queries";
import type { Usuario } from "../../lib/types";

export default function ConfiguracoesPage() {
  return <ProtectedRoute perfisPermitidos={["admin", "supervisora"]}>{(usuario) => <Conteudo usuario={usuario} />}</ProtectedRoute>;
}

function Conteudo({ usuario }: { usuario: Usuario }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<(Usuario & { id: string })[]>([]);
  const [mensagemAdmin, setMensagemAdmin] = useState<string | null>(null);

  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (podeAdmin(usuario.perfil)) {
      listarUsuarios().then(setUsuarios);
    }
  }, [usuario.perfil]);

  async function handleTrocarSenha() {
    setMensagemSenha(null);
    if (!novaSenha || !confirmarSenha) {
      setMensagemSenha("Preencha e confirme a nova senha.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMensagemSenha("As senhas não conferem.");
      return;
    }
    if (novaSenha.length < 6) {
      setMensagemSenha("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      if (!auth.currentUser) throw new Error("Sessão expirada.");
      await updatePassword(auth.currentUser, novaSenha);
      setMensagemSenha("Senha alterada com sucesso.");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        setMensagemSenha(
          "Por segurança, o Firebase exige login recente para trocar a senha. Saia e entre de novo, depois tente outra vez."
        );
      } else {
        setMensagemSenha("Não foi possível trocar a senha. Tente novamente.");
      }
    }
  }

  async function handleEnviarResetEmail(email: string) {
    setMensagemAdmin(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMensagemAdmin(`E-mail de redefinição enviado para ${email}.`);
    } catch {
      setMensagemAdmin(`Não foi possível enviar o e-mail para ${email}.`);
    }
  }

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

        <h2>Alterar minha senha</h2>
        <div style={{ maxWidth: 360 }}>
          <label style={{ display: "block" }}>Nova senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <label style={{ display: "block" }}>Confirmar nova senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button onClick={handleTrocarSenha}>Salvar minha nova senha</button>
          {mensagemSenha && <p>{mensagemSenha}</p>}
        </div>

        {podeAdmin(usuario.perfil) && (
          <>
            <h2 style={{ marginTop: "2rem" }}>Gerenciar senhas das lojas</h2>
            <p style={{ background: "#fff3cd", padding: "0.75rem", borderRadius: 6 }}>
              ⚠️ Diferença real de plataforma: o app original define a senha de qualquer
              usuário diretamente (grava o hash no banco). O <strong>Firebase client SDK não
              permite isso</strong> — só é possível via Admin SDK, rodando em backend (Cloud
              Function), o que este projeto ainda não tem. A alternativa segura disponível aqui é
              enviar um <strong>e-mail de redefinição</strong>: a pessoa recebe um link e escolhe
              a senha nova ela mesma.
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Nome</th>
                  <th align="left">Perfil</th>
                  <th align="left">Loja</th>
                  <th align="left"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.perfil}</td>
                    <td>{u.lojaVinculada ?? "Todas"}</td>
                    <td>
                      <button
                        onClick={() =>
                          handleEnviarResetEmail((u as unknown as { email?: string }).email ?? "")
                        }
                      >
                        Enviar e-mail de redefinição
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mensagemAdmin && <p>{mensagemAdmin}</p>}
            <p style={{ fontSize: 12, color: "#666" }}>
              Nota: o documento do usuário em <code>usuarios/{"{uid}"}</code> hoje só guarda{" "}
              <code>nome</code> e <code>perfil</code> — para o envio de e-mail funcionar, adicione
              também um campo <code>email</code> a cada documento.
            </p>
          </>
        )}

        <h2 style={{ marginTop: "2rem" }}>Backup / Exportação</h2>
        <p style={{ color: "#666" }}>
          O app original faz backup local só para SQLite (copia o arquivo); para Supabase,
          recomenda usar o backup nativo do Supabase ou exportar CSV. Aqui, sem um arquivo único
          de banco, o equivalente disponível é exportar as avaliações que você tem acesso em JSON:
        </p>
        <button disabled={exportando} onClick={handleExportarAvaliacoes}>
          {exportando ? "Exportando..." : "Exportar minhas avaliações (JSON)"}
        </button>

        <h2 style={{ marginTop: "2rem" }}>Pontos importantes</h2>
        <ul>
          <li>Gestoras não conseguem criar avaliações. Elas acessam Dashboard, Histórico e Planos de Ação.</li>
          <li>
            O banco de dados é o Firestore (Firebase) — não há distinção SQLite/Postgres como no
            app original.
          </li>
        </ul>
      </main>
    </div>
  );
}
