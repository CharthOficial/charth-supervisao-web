"use client";

import type { FormSectionConfig } from "../lib/formConfig";
import type { RespostaDeSecao } from "../lib/types";

interface FormSectionProps {
  config: FormSectionConfig;
  valor: RespostaDeSecao;
  onChangeResposta: (perguntaKey: string, nota: number) => void;
  onChangeObservacao: (texto: string) => void;
  onChangeFoto?: (file: File | null) => void;
  enviandoFoto?: boolean;
}

/**
 * Componente genérico usado por todas as 8 seções de FORM_SECTIONS
 * (lib/formConfig.ts) — espelha exatamente score_input() e o loop de
 * seções do src/forms.py original.
 *
 * Tipos de pergunta:
 *  - "score":          escala 1 a 10
 *  - "binary":         Sim = 10, Não = 0
 *  - "binary_inverse": Não = 10, Sim = 0 (ex: "Existem lâmpadas queimadas?")
 */
export default function FormSection({
  config,
  valor,
  onChangeResposta,
  onChangeObservacao,
  onChangeFoto,
  enviandoFoto,
}: FormSectionProps) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
        {config.name}
      </h2>

      {config.questions.map((q) => (
        <div key={q.key} style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            {q.label}
          </label>

          {q.type === "score" && (
            <>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>escala de 1 a 10</span>
              <input
                type="range"
                min={1}
                max={10}
                value={valor.respostas[q.key] ?? 10}
                onChange={(e) => onChangeResposta(q.key, Number(e.target.value))}
              />
              <span style={{ marginLeft: "0.5rem" }}>{valor.respostas[q.key] ?? 10}</span>
            </>
          )}

          {q.type === "binary" && (
            <>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>
                resposta binária: sim = 10 · não = 0
              </span>
              <select
                value={valor.respostas[q.key] === 10 ? "sim" : "nao"}
                onChange={(e) => onChangeResposta(q.key, e.target.value === "sim" ? 10 : 0)}
              >
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </>
          )}

          {q.type === "binary_inverse" && (
            <>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>
                resposta binária: não = 10 · sim = 0
              </span>
              <select
                value={valor.respostas[q.key] === 10 ? "nao" : "sim"}
                onChange={(e) => onChangeResposta(q.key, e.target.value === "nao" ? 10 : 0)}
              >
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </>
          )}
        </div>
      ))}

      {config.photoKey && onChangeFoto && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Evidência visual (opcional)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={enviandoFoto}
            onChange={(e) => onChangeFoto(e.target.files?.[0] ?? null)}
          />
          {enviandoFoto && <p style={{ fontSize: 12, color: "#666" }}>Comprimindo imagem...</p>}
          {valor.fotoBase64 && !enviandoFoto && (
            <div style={{ marginTop: "0.5rem" }}>
              <img
                src={valor.fotoBase64}
                alt="Evidência visual"
                style={{ maxWidth: 200, borderRadius: 8, display: "block" }}
              />
              <button type="button" onClick={() => onChangeFoto(null)} style={{ marginTop: "0.25rem" }}>
                Remover foto
              </button>
            </div>
          )}
        </div>
      )}

      <label style={{ display: "block", marginBottom: "0.25rem" }}>
        Observações {config.name}
      </label>
      <textarea
        value={valor.observacao}
        onChange={(e) => onChangeObservacao(e.target.value)}
        placeholder="Registre aqui os principais pontos observados, combinados e oportunidades de evolução."
        rows={3}
        style={{ width: "100%" }}
      />
    </section>
  );
}
