"use client";

import { useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import FormSectionComponent from "../../../components/FormSection";
import { Identificacao, PerguntasEstrategicas } from "../../../components/IdentificacaoEEstrategicas";
import { FORM_SECTIONS } from "../../../lib/formConfig";
import { calcularMediaPonderada, statusFromWeighted } from "../../../lib/calculations";
import { comprimirImagem, tamanhoAproximadoKB } from "../../../lib/imageCompression";
import { salvarAvaliacao } from "../../../lib/firestore-queries";
import type { Avaliacao, RespostaDeSecao } from "../../../lib/types";

function secoesVazias(): Record<string, RespostaDeSecao> {
  const inicial: Record<string, RespostaDeSecao> = {};
  for (const secao of FORM_SECTIONS) {
    // Replica o comportamento real do Streamlit: st.radio(..., index=0)
    // sempre pré-seleciona a primeira opção, que nas perguntas binárias é
    // sempre a opção "boa" (nota 10) — score e binary/binary_inverse
    // coincidem em nota 10 como padrão. Sem isso, perguntas não tocadas
    // ficavam de fora do cálculo (contando como 0), gerando uma média
    // artificialmente baixa.
    const respostas: Record<string, number> = {};
    for (const pergunta of secao.questions) {
      respostas[pergunta.key] = 10;
    }
    inicial[secao.name] = { respostas, observacao: "" };
  }
  return inicial;
}

export default function NovaAvaliacaoPage() {
  // Identificação
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [supervisora, setSupervisora] = useState("");
  const [gerente, setGerente] = useState("");
  const [loja, setLoja] = useState("");

  // As 8 seções de FORM_SECTIONS, todas geridas pelo mesmo estado genérico.
  const [secoes, setSecoes] = useState<Record<string, RespostaDeSecao>>(secoesVazias());

  // Perguntas estratégicas (seção final)
  const [maiorRisco, setMaiorRisco] = useState("");
  const [maiorOportunidade, setMaiorOportunidade] = useState("");
  const [virarOuro, setVirarOuro] = useState("");
  const [dnaCharth, setDnaCharth] = useState("Totalmente");
  const [faltaGraveDisciplinar, setFaltaGraveDisciplinar] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  function atualizarResposta(secaoNome: string, perguntaKey: string, nota: number) {
    setSecoes((prev) => ({
      ...prev,
      [secaoNome]: {
        ...prev[secaoNome],
        respostas: { ...prev[secaoNome].respostas, [perguntaKey]: nota },
      },
    }));
  }

  function atualizarObservacao(secaoNome: string, texto: string) {
    setSecoes((prev) => ({
      ...prev,
      [secaoNome]: { ...prev[secaoNome], observacao: texto },
    }));
  }

  // Controla qual seção está comprimindo uma foto agora, pra desabilitar
  // o campo e mostrar "Comprimindo imagem..." só naquela seção.
  const [enviandoFoto, setEnviandoFoto] = useState<Record<string, boolean>>({});

  async function atualizarFoto(secaoNome: string, file: File | null) {
    if (!file) {
      setSecoes((prev) => ({
        ...prev,
        [secaoNome]: { ...prev[secaoNome], fotoBase64: undefined },
      }));
      return;
    }

    setEnviandoFoto((prev) => ({ ...prev, [secaoNome]: true }));
    try {
      const base64 = await comprimirImagem(file);
      const kb = tamanhoAproximadoKB(base64);
      if (kb > 700) {
        // Salvaguarda: o documento inteiro da avaliação (com todas as
        // seções + eventual 2ª foto) precisa ficar abaixo de 1MB, o
        // limite do Firestore. 700KB para uma única foto já é um
        // sinal de que a compressão não foi suficiente para esta imagem.
        setMensagem(
          `A imagem ficou com ${kb}KB mesmo comprimida — tente uma foto com resolução menor.`
        );
      }
      setSecoes((prev) => ({
        ...prev,
        [secaoNome]: { ...prev[secaoNome], fotoBase64: base64 },
      }));
    } catch {
      setMensagem("Não foi possível processar essa imagem. Tente outra foto.");
    } finally {
      setEnviandoFoto((prev) => ({ ...prev, [secaoNome]: false }));
    }
  }

  async function handleSalvar(supervisoraUid: string) {
    if (!supervisora.trim() || !gerente || !loja) {
      setMensagem("Preencha Supervisora, Gerente de Loja e Loja antes de salvar.");
      return;
    }

    const totalFotosKB = Object.values(secoes).reduce(
      (soma, s) => soma + (s.fotoBase64 ? tamanhoAproximadoKB(s.fotoBase64) : 0),
      0
    );
    if (totalFotosKB > 850) {
      setMensagem(
        `As fotos somam ${totalFotosKB}KB — perto do limite de 1MB por avaliação no Firestore. Remova alguma foto ou use uma com resolução menor antes de salvar.`
      );
      return;
    }

    setSalvando(true);
    setMensagem(null);

    const avaliacaoBase: Omit<Avaliacao, "id" | "notaFinalPonderada" | "status"> = {
      data,
      supervisoraNome: supervisora.trim(),
      supervisoraUid,
      gerente,
      lojaId: loja,
      lojaNome: loja,
      secoes,
      estrategicas: {
        maior_risco: maiorRisco,
        maior_oportunidade: maiorOportunidade,
        virar_ouro: virarOuro,
        dna_charth: dnaCharth as "Totalmente" | "Parcialmente" | "Não",
        faltaGraveDisciplinar,
      },
      bonus: {},
    };

    const notaFinalPonderada = calcularMediaPonderada(avaliacaoBase as Avaliacao);
    const status = statusFromWeighted(notaFinalPonderada);

    try {
      await salvarAvaliacao({ ...avaliacaoBase, notaFinalPonderada, status });
      setMensagem(`Avaliação salva. Média ponderada: ${notaFinalPonderada.toFixed(2)}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ProtectedRoute perfisPermitidos={["admin", "supervisora"]}>
      {(usuario) => (
        <div className="layout-autenticado">
          <Sidebar usuario={usuario} />
          <main className="conteudo">
            <Header title="Nova Avaliação" subtitle="Formulário oficial de supervisão das lojas CHARTH." />

            <div className="charth-form-hero">
              <div className="charth-form-hero-title">Avaliação Supervisão Varejo</div>
              <div className="charth-form-hero-subtitle">
                Preencha com atenção aos detalhes. A avaliação consolida atendimento, VM,
                resultados, gestão e experiência da cliente, preservando o padrão premium,
                atemporal e o acompanhamento operacional da CHARTH.
              </div>
            </div>

            <Identificacao
              data={data}
              supervisora={supervisora}
              gerente={gerente}
              loja={loja}
              onChangeData={setData}
              onChangeSupervisora={setSupervisora}
              onChangeGerente={setGerente}
              onChangeLoja={setLoja}
            />

            {FORM_SECTIONS.map((secaoConfig) => (
              <FormSectionComponent
                key={secaoConfig.name}
                config={secaoConfig}
                valor={secoes[secaoConfig.name]}
                onChangeResposta={(perguntaKey, nota) =>
                  atualizarResposta(secaoConfig.name, perguntaKey, nota)
                }
                onChangeObservacao={(texto) => atualizarObservacao(secaoConfig.name, texto)}
                onChangeFoto={
                  secaoConfig.photoKey
                    ? (file) => atualizarFoto(secaoConfig.name, file)
                    : undefined
                }
                enviandoFoto={enviandoFoto[secaoConfig.name] ?? false}
              />
            ))}

            <PerguntasEstrategicas
              maiorRisco={maiorRisco}
              maiorOportunidade={maiorOportunidade}
              virarOuro={virarOuro}
              dnaCharth={dnaCharth}
              faltaGraveDisciplinar={faltaGraveDisciplinar}
              onChangeMaiorRisco={setMaiorRisco}
              onChangeMaiorOportunidade={setMaiorOportunidade}
              onChangeVirarOuro={setVirarOuro}
              onChangeDnaCharth={setDnaCharth}
              onChangeFaltaGraveDisciplinar={setFaltaGraveDisciplinar}
            />

            {mensagem && <p style={{ fontWeight: 600 }}>{mensagem}</p>}

            <button disabled={salvando} onClick={() => handleSalvar(usuario.uid)}>
              {salvando ? "Salvando..." : "Salvar avaliação"}
            </button>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
