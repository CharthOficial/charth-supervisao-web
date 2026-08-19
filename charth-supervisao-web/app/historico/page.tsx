"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { listarAvaliacoes, excluirAvaliacao } from "../../lib/firestore-queries";
import { formatarDataBR } from "../../lib/dateUtils";
import { computeSectionScores, computeBonus, scoreBadgeDashboard } from "../../lib/calculations";
import { FORM_SECTIONS, OBSERVATION_LABELS, STRATEGIC_LABELS } from "../../lib/formConfig";
import type { Avaliacao, Usuario } from "../../lib/types";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: color,
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

function DetalheAvaliacao({ avaliacao }: { avaliacao: Avaliacao }) {
  const sectionScores = computeSectionScores(avaliacao.secoes);
  const bonus = computeBonus(sectionScores, avaliacao.notaFinalPonderada, avaliacao.estrategicas.faltaGraveDisciplinar);
  const [aba, setAba] = useState<"secoes" | "estrategicas" | "observacoes">("secoes");

  return (
    <div style={{ marginTop: "1.5rem", border: "1px solid #ddd", borderRadius: 8, padding: "1rem" }}>
      <h2>
        {avaliacao.lojaNome} — {formatarDataBR(avaliacao.data)}
      </h2>
      <p>
        <strong>Gerente:</strong> {avaliacao.gerente} · <strong>Supervisora:</strong>{" "}
        {avaliacao.supervisoraNome}
        <br />
        <strong>Média ponderada:</strong> {avaliacao.notaFinalPonderada.toFixed(2)} ·{" "}
        <strong>Status:</strong> {avaliacao.status} · <strong>Bônus:</strong> {bonus.level}
        {bonus.managerBonus > 0 && ` (R$ ${bonus.managerBonus.toLocaleString("pt-BR")})`}
      </p>
      <p style={{ fontSize: 12, color: "#666" }}>
        ⚠️ Bônus calculado agora, na hora de exibir (via <code>computeBonus</code>) — confirmado em{" "}
        <code>src/db.py</code> que o app original salva <code>bonus_json</code> sempre vazio para
        avaliações criadas pelo formulário atual, então o Histórico real hoje mostraria essa
        coluna em branco. Isto aqui é um cálculo ao vivo, não uma cópia do dado salvo.
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setAba("secoes")}>Médias por seção</button>
        <button onClick={() => setAba("estrategicas")}>Perguntas estratégicas</button>
        <button onClick={() => setAba("observacoes")}>Observações</button>
      </div>

      {aba === "secoes" && (
        <div>
          {FORM_SECTIONS.map((s) => {
            const nota = sectionScores[s.name] ?? 0;
            const badge = scoreBadgeDashboard(nota);
            return (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>{s.name}</span>
                <Badge label={`${badge.label} · ${nota.toFixed(2)}`} color={badge.color} />
              </div>
            );
          })}
        </div>
      )}

      {aba === "estrategicas" && (
        <div>
          {Object.entries(STRATEGIC_LABELS).map(([key, label]) => (
            <div key={key} style={{ marginBottom: "0.75rem" }}>
              <strong>{label}</strong>
              <p>
                {(avaliacao.estrategicas as unknown as Record<string, string>)[key] ||
                  "Sem observação registrada."}
              </p>
            </div>
          ))}
        </div>
      )}

      {aba === "observacoes" && (
        <div>
          {Object.entries(OBSERVATION_LABELS).map(([key, label]) => {
            const secao = FORM_SECTIONS.find((s) => s.observationKey === key);
            if (!secao) return null; // pula chaves legadas sem seção correspondente hoje
            const resposta = avaliacao.secoes[secao.name];
            return (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <strong>{label}</strong>
                <p>{resposta?.observacao || "Sem observação registrada."}</p>
                {resposta?.fotoBase64 && (
                  <img
                    src={resposta.fotoBase64}
                    alt={`Evidência visual — ${label}`}
                    style={{ maxWidth: 240, borderRadius: 8 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HistoricoPage() {
  return (
    <ProtectedRoute>
      {(usuario) => <ConteudoHistorico usuario={usuario} />}
    </ProtectedRoute>
  );
}

function ConteudoHistorico({ usuario }: { usuario: Usuario }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState("Todas");
  const [ordenar, setOrdenar] = useState<"recentes" | "melhor" | "menor">("recentes");
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);

  useEffect(() => {
    listarAvaliacoes(usuario).then(setAvaliacoes);
  }, [usuario]);

  const lojas = useMemo(
    () => Array.from(new Set(avaliacoes.map((a) => a.lojaNome))).sort(),
    [avaliacoes]
  );

  const filtradas = useMemo(() => {
    let lista = lojaFiltro === "Todas" ? avaliacoes : avaliacoes.filter((a) => a.lojaNome === lojaFiltro);
    lista = [...lista];
    if (ordenar === "melhor") lista.sort((a, b) => b.notaFinalPonderada - a.notaFinalPonderada);
    else if (ordenar === "menor") lista.sort((a, b) => a.notaFinalPonderada - b.notaFinalPonderada);
    else {
      lista.sort((a, b) => {
        const diffData = new Date(b.data).getTime() - new Date(a.data).getTime();
        if (diffData !== 0) return diffData;
        const criadoA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
        const criadoB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
        return criadoB - criadoA;
      });
    }
    return lista;
  }, [avaliacoes, lojaFiltro, ordenar]);

  const selecionada = filtradas.find((a) => a.id === selecionadaId) ?? null;

  async function handleExcluir(id: string) {
    if (!confirm(`Confirma excluir a avaliação #${id}? Isso também remove os planos de ação vinculados.`)) return;
    await excluirAvaliacao(id);
    setAvaliacoes((prev) => prev.filter((a) => a.id !== id));
    setSelecionadaId(null);
  }

  return (
    <div className="layout-autenticado">
      <Sidebar usuario={usuario} />
      <main className="conteudo">
        <Header
          title="Histórico de Avaliações"
          subtitle="Consulta executiva das avaliações salvas, com médias, pontos estratégicos e observações."
        />

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <select value={lojaFiltro} onChange={(e) => setLojaFiltro(e.target.value)}>
            <option value="Todas">Todas as lojas</option>
            {lojas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select value={ordenar} onChange={(e) => setOrdenar(e.target.value as typeof ordenar)}>
            <option value="recentes">Mais recentes</option>
            <option value="melhor">Melhor média</option>
            <option value="menor">Menor média</option>
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Data</th>
              <th align="left">Loja</th>
              <th align="left">Supervisora</th>
              <th align="left">Gerente</th>
              <th align="left">Média</th>
              <th align="left">Status</th>
              <th align="left"></th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((a) => (
              <tr key={a.id}>
                <td>{formatarDataBR(a.data)}</td>
                <td>{a.lojaNome}</td>
                <td>{a.supervisoraNome}</td>
                <td>{a.gerente}</td>
                <td>{a.notaFinalPonderada.toFixed(2)}</td>
                <td>{a.status}</td>
                <td>
                  <button onClick={() => setSelecionadaId(a.id)}>Abrir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selecionada && (
          <>
            <DetalheAvaliacao avaliacao={selecionada} />
            {usuario.perfil === "admin" && (
              <div style={{ marginTop: "1rem" }}>
                <button onClick={() => handleExcluir(selecionada.id)} style={{ color: "crimson" }}>
                  Excluir avaliação (área Admin)
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
