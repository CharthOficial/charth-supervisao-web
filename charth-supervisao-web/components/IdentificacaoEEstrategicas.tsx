"use client";

import { MANAGERS, STORES } from "../lib/formConfig";

interface IdentificacaoProps {
  data: string;
  supervisora: string;
  gerente: string;
  loja: string;
  onChangeData: (v: string) => void;
  onChangeSupervisora: (v: string) => void;
  onChangeGerente: (v: string) => void;
  onChangeLoja: (v: string) => void;
}

/** Seção 1 do formulário — campos fixos, não vem de FORM_SECTIONS. */
export function Identificacao({
  data,
  supervisora,
  gerente,
  loja,
  onChangeData,
  onChangeSupervisora,
  onChangeGerente,
  onChangeLoja,
}: IdentificacaoProps) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
        1. Identificação
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={{ display: "block" }}>Data</label>
          <input type="date" value={data} onChange={(e) => onChangeData(e.target.value)} />
        </div>

        <div>
          <label style={{ display: "block" }}>Supervisora</label>
          <input
            type="text"
            value={supervisora}
            onChange={(e) => onChangeSupervisora(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: "block" }}>Gerente de Loja</label>
          <select value={gerente} onChange={(e) => onChangeGerente(e.target.value)}>
            <option value="">Selecione...</option>
            {MANAGERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block" }}>Loja</label>
          <select value={loja} onChange={(e) => onChangeLoja(e.target.value)}>
            <option value="">Selecione...</option>
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

interface EstrategicasProps {
  maiorRisco: string;
  maiorOportunidade: string;
  virarOuro: string;
  dnaCharth: string;
  faltaGraveDisciplinar: boolean;
  onChangeMaiorRisco: (v: string) => void;
  onChangeMaiorOportunidade: (v: string) => void;
  onChangeVirarOuro: (v: string) => void;
  onChangeDnaCharth: (v: string) => void;
  onChangeFaltaGraveDisciplinar: (v: boolean) => void;
}

/** Seção final — perguntas qualitativas para gestão da loja. */
export function PerguntasEstrategicas({
  maiorRisco,
  maiorOportunidade,
  virarOuro,
  dnaCharth,
  faltaGraveDisciplinar,
  onChangeMaiorRisco,
  onChangeMaiorOportunidade,
  onChangeVirarOuro,
  onChangeDnaCharth,
  onChangeFaltaGraveDisciplinar,
}: EstrategicasProps) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
        Perguntas Estratégicas
      </h2>

      <label style={{ display: "block" }}>Maior risco da loja hoje</label>
      <textarea
        value={maiorRisco}
        onChange={(e) => onChangeMaiorRisco(e.target.value)}
        rows={2}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <label style={{ display: "block" }}>Maior oportunidade de crescimento imediato</label>
      <textarea
        value={maiorOportunidade}
        onChange={(e) => onChangeMaiorOportunidade(e.target.value)}
        rows={2}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <label style={{ display: "block" }}>O que precisa acontecer para virar Ouro</label>
      <textarea
        value={virarOuro}
        onChange={(e) => onChangeVirarOuro(e.target.value)}
        rows={2}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <label style={{ display: "block" }}>A loja representa o DNA da Charth?</label>
      <select
        value={dnaCharth}
        onChange={(e) => onChangeDnaCharth(e.target.value)}
        style={{ marginBottom: "1rem" }}
      >
        <option value="Totalmente">Totalmente</option>
        <option value="Parcialmente">Parcialmente</option>
        <option value="Não">Não</option>
      </select>

      <div>
        <label style={{ display: "block" }}>
          Houve falta grave disciplinar no período avaliado?
        </label>
        <select
          value={faltaGraveDisciplinar ? "sim" : "nao"}
          onChange={(e) => onChangeFaltaGraveDisciplinar(e.target.value === "sim")}
        >
          <option value="nao">Não</option>
          <option value="sim">Sim</option>
        </select>
      </div>
    </section>
  );
}
