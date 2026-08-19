"use client";

import FormSection, { Pergunta } from "../FormSection";

// Substitua pelas perguntas reais da seção "Identificação" no app.py
// original. Esta é só uma seção de exemplo — as outras 10 seções seguem
// exatamente este mesmo padrão, mudando apenas a lista de perguntas.
const PERGUNTAS: Pergunta[] = [
  { id: "loja_identificada", texto: "Loja corretamente identificada?", tipo: "binaria" },
  { id: "apresentacao_geral", texto: "Apresentação geral da fachada", tipo: "escala" },
];

interface Props {
  respostas: Record<string, number>;
  onChange: (perguntaId: string, valor: number) => void;
}

export default function SecaoIdentificacao({ respostas, onChange }: Props) {
  return (
    <FormSection
      titulo="1. Identificação"
      perguntas={PERGUNTAS}
      respostas={respostas}
      onChange={onChange}
    />
  );
}
