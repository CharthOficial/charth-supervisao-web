"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { listarPlanosDeAcao, atualizarPlanoDeAcao } from "../../lib/firestore-queries";
import { actionSuggestion } from "../../lib/actionSuggestions";
import {
  ACTION_PLAN_STATUS_OPTIONS,
  ACTION_PLAN_PRIORITY_OPTIONS,
  ACTION_PLAN_STATUS_COLOR,
  ACTION_PLAN_PRIORITY_COLOR,
} from "../../lib/formConfig";
import type { PlanoAcao, Usuario } from "../../lib/types";

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
        marginRight: 6,
      }}
    >
      {label}
    </span>
  );
}

function estaVencido(plano: PlanoAcao): boolean {
  if (plano.status === "Concluído" || plano.status === "Cancelado") return false;
  return new Date(plano.prazo) < new Date(new Date().toDateString());
}

function CartaoPlano({
  plano,
  podeEditar,
  onSalvar,
}: {
  plano: PlanoAcao;
  podeEditar: boolean;
  onSalvar: (id: string, updates: Pick<PlanoAcao, "status" | "responsavel" | "prazo" | "observacoes">) => void;
}) {
  const sugestao = actionSuggestion(plano.perguntaKey, plano.secao, plano.perguntaLabel);
  const vencido = estaVencido(plano);

  const [status, setStatus] = useState(plano.status);
  const [responsavel, setResponsavel] = useState(plano.responsavel);
  const [prazo, setPrazo] = useState(plano.prazo);
  const [observacoes, setObservacoes] = useState(plano.observacoes);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1rem",
        marginBottom: "1rem",
        borderLeft: vencido ? "4px solid #7F3438" : "4px solid #ddd",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {plano.lojaId} · {plano.secao}
          </div>
          <h3 style={{ margin: "0.25rem 0" }}>{plano.perguntaLabel}</h3>
        </div>
        <div>
          <Badge label={plano.prioridade} color={ACTION_PLAN_PRIORITY_COLOR[plano.prioridade]} />
          <Badge label={plano.status} color={ACTION_PLAN_STATUS_COLOR[plano.status]} />
          {vencido && <Badge label="Vencido" color="#7F3438" />}
        </div>
      </div>

      <p>
        <strong>Nota:</strong> {plano.nota.toFixed(2)} · <strong>Responsável:</strong>{" "}
        {plano.responsavel || "Não definido"} · <strong>Prazo:</strong>{" "}
        {new Date(plano.prazo).toLocaleDateString("pt-BR")}
      </p>

      <details style={{ marginBottom: "0.5rem" }}>
        <summary style={{ cursor: "pointer", fontSize: 13, color: "#666" }}>
          Campos salvos no documento (problema/impacto/ação/validação) — não exibidos na tela do
          app original, mantidos aqui por fidelidade ao schema real
        </summary>
        <div style={{ padding: "0.5rem", fontSize: 13, color: "#444" }}>
          <p>
            <strong>Problema:</strong> {plano.problema}
          </p>
          <p>
            <strong>Impacto:</strong> {plano.impacto}
          </p>
          <p>
            <strong>Ação recomendada (salva):</strong> {plano.acaoRecomendada}
          </p>
          <p>
            <strong>Critério de validação:</strong> {plano.criterioValidacao}
          </p>
        </div>
      </details>

      <div style={{ background: "#f7f4f2", padding: "0.75rem", borderRadius: 6, marginBottom: "0.75rem" }}>
        <strong>Ação sugerida (exibida na tela):</strong>
        <p>{sugestao.acao}</p>
        <strong>Evidência esperada:</strong>
        <p>{sugestao.evidencia}</p>
      </div>

      {podeEditar ? (
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as PlanoAcao["status"])}>
            {ACTION_PLAN_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label style={{ marginLeft: "1rem" }}>Responsável</label>
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />

          <label style={{ marginLeft: "1rem" }}>Prazo</label>
          <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />

          <div style={{ marginTop: "0.5rem" }}>
            <label style={{ display: "block" }}>Plano definido pela supervisora / acompanhamento</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              style={{ width: "100%" }}
            />
          </div>

          <button
            style={{ marginTop: "0.5rem" }}
            onClick={() => onSalvar(plano.id, { status, responsavel, prazo, observacoes })}
          >
            Salvar atualização
          </button>
        </div>
      ) : (
        <p style={{ color: "#666", fontSize: 13 }}>
          Gestoras visualizam os planos. Alteração fica com a supervisora/admin.
        </p>
      )}
    </div>
  );
}

export default function PlanosDeAcaoPage() {
  return <ProtectedRoute>{(usuario) => <ConteudoPlanos usuario={usuario} />}</ProtectedRoute>;
}

function ConteudoPlanos({ usuario }: { usuario: Usuario }) {
  const [planos, setPlanos] = useState<PlanoAcao[]>([]);
  const [lojasSelecionadas, setLojasSelecionadas] = useState<string[]>([]);
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([
    "Aberto",
    "Em andamento",
    "Reprogramado",
  ]);
  const [soVencidos, setSoVencidos] = useState(false);

  useEffect(() => {
    listarPlanosDeAcao(usuario).then((lista) => {
      setPlanos(lista);
      setLojasSelecionadas(Array.from(new Set(lista.map((p) => p.lojaId))));
    });
  }, [usuario]);

  const lojasDisponiveis = useMemo(() => Array.from(new Set(planos.map((p) => p.lojaId))), [planos]);

  const filtrados = useMemo(() => {
    return planos.filter((p) => {
      if (!lojasSelecionadas.includes(p.lojaId)) return false;
      if (!statusSelecionados.includes(p.status)) return false;
      if (soVencidos && !estaVencido(p)) return false;
      return true;
    });
  }, [planos, lojasSelecionadas, statusSelecionados, soVencidos]);

  async function handleSalvar(
    id: string,
    updates: Pick<PlanoAcao, "status" | "responsavel" | "prazo" | "observacoes">
  ) {
    const planoAtual = planos.find((p) => p.id === id);
    await atualizarPlanoDeAcao(id, updates, usuario.nome, planoAtual);
    setPlanos((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  const podeEditar = usuario.perfil !== "gestora";
  const abertos = filtrados.filter((p) => !["Concluído", "Cancelado"].includes(p.status));
  const vencidos = filtrados.filter(estaVencido);
  const prioridadeAlta = filtrados.filter((p) => p.prioridade === "Alta");

  return (
    <div className="layout-autenticado">
      <Sidebar usuario={usuario} />
      <main className="conteudo">
        <Header
          title="Planos de Ação"
          subtitle="Acompanhamento das pendências geradas por notas abaixo do padrão, com edição por plano."
        />

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block" }}>Loja</label>
            <select
              multiple
              value={lojasSelecionadas}
              onChange={(e) =>
                setLojasSelecionadas(Array.from(e.target.selectedOptions, (o) => o.value))
              }
            >
              {lojasDisponiveis.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block" }}>Status</label>
            <select
              multiple
              value={statusSelecionados}
              onChange={(e) =>
                setStatusSelecionados(Array.from(e.target.selectedOptions, (o) => o.value))
              }
            >
              {ACTION_PLAN_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <label style={{ alignSelf: "center" }}>
            <input
              type="checkbox"
              checked={soVencidos}
              onChange={(e) => setSoVencidos(e.target.checked)}
            />{" "}
            Mostrar só vencidos
          </label>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <strong>{filtrados.length}</strong> planos filtrados
          </div>
          <div>
            <strong>{abertos.length}</strong> em aberto
          </div>
          <div>
            <strong>{prioridadeAlta.length}</strong> prioridade alta
          </div>
          <div>
            <strong>{vencidos.length}</strong> vencidos
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p>Nenhum plano encontrado para os filtros selecionados.</p>
        ) : (
          filtrados.map((plano) => (
            <CartaoPlano key={plano.id} plano={plano} podeEditar={podeEditar} onSalvar={handleSalvar} />
          ))
        )}
      </main>
    </div>
  );
}
