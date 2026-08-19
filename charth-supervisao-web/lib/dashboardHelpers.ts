import { statusFromWeighted } from "./calculations";
import type { Avaliacao } from "./types";

/** Última avaliação de cada loja — replica
 *  `.sort_values(["evaluation_date","id"], ...).drop_duplicates("store")`
 *  do dashboard.py. Desempata por `criadoEm` quando a data escolhida
 *  pela supervisora é igual entre avaliações da mesma loja (bem comum
 *  em testes, e possível também em uso real — mais de uma visita
 *  registrada no mesmo dia). Sem isso, a "mais recente" podia ficar
 *  arbitrária, mostrando uma avaliação antiga no Dashboard mesmo
 *  havendo uma mais nova salva depois no mesmo dia. */
export function ultimaPorLoja(avaliacoes: Avaliacao[]): Avaliacao[] {
  const porLoja = new Map<string, Avaliacao>();
  for (const a of avaliacoes) {
    const atual = porLoja.get(a.lojaNome);
    if (!atual) {
      porLoja.set(a.lojaNome, a);
      continue;
    }
    const dataA = new Date(a.data).getTime();
    const dataAtual = new Date(atual.data).getTime();
    if (dataA > dataAtual) {
      porLoja.set(a.lojaNome, a);
    } else if (dataA === dataAtual) {
      const criadoA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const criadoAtual = atual.criadoEm ? new Date(atual.criadoEm).getTime() : 0;
      if (criadoA > criadoAtual) {
        porLoja.set(a.lojaNome, a);
      }
    }
  }
  return Array.from(porLoja.values());
}

export interface RankingLoja {
  loja: string;
  media: number;
  status: string;
}

/** Média por loja no recorte atual, com o status calculado sobre essa
 *  média — replica a aba "Visão geral" > "Ranking de lojas". */
export function rankingPorLoja(avaliacoes: Avaliacao[]): RankingLoja[] {
  const somaPorLoja = new Map<string, { soma: number; count: number }>();
  for (const a of avaliacoes) {
    const atual = somaPorLoja.get(a.lojaNome) ?? { soma: 0, count: 0 };
    atual.soma += a.notaFinalPonderada;
    atual.count += 1;
    somaPorLoja.set(a.lojaNome, atual);
  }

  return Array.from(somaPorLoja.entries())
    .map(([loja, { soma, count }]) => {
      const media = soma / count;
      return { loja, media, status: statusFromWeighted(media) };
    })
    .sort((a, b) => b.media - a.media);
}

const ORDEM_STATUS = [
  "Excelência CHARTH",
  "Loja Forte",
  "Loja em Atenção",
  "Plano de Ação Imediato",
];

/** Contagem de lojas em cada status, baseado na ÚLTIMA avaliação de cada
 *  loja — replica o gráfico de pizza "Status operacional". */
export function contagemPorStatus(ultimas: Avaliacao[]): { status: string; quantidade: number }[] {
  const contagem = new Map(ORDEM_STATUS.map((s) => [s, 0]));
  for (const a of ultimas) {
    const status = statusFromWeighted(a.notaFinalPonderada);
    contagem.set(status, (contagem.get(status) ?? 0) + 1);
  }
  return ORDEM_STATUS.map((status) => ({ status, quantidade: contagem.get(status) ?? 0 }));
}

export function melhorLoja(avaliacoes: Avaliacao[]): string {
  const ranking = rankingPorLoja(avaliacoes);
  return ranking[0]?.loja ?? "-";
}

export function mediaGeral(avaliacoes: Avaliacao[]): number {
  if (avaliacoes.length === 0) return 0;
  const soma = avaliacoes.reduce((s, a) => s + a.notaFinalPonderada, 0);
  return soma / avaliacoes.length;
}

export function lojasEmAtencao(ultimas: Avaliacao[]): number {
  return ultimas.filter((a) => {
    const status = statusFromWeighted(a.notaFinalPonderada);
    return status === "Loja em Atenção" || status === "Plano de Ação Imediato";
  }).length;
}

export interface ResumoLoja {
  loja: string;
  mediaGeral: number;
  avaliacoes: number;
  ultimaAvaliacao: string;
  statusMedio: string;
}

/** Resumo por loja para a aba "Lojas" — replica o groupby de
 *  media_geral/avaliacoes/ultima_avaliacao do dashboard.py original. */
export function resumoPorLoja(avaliacoes: Avaliacao[]): ResumoLoja[] {
  const porLoja = new Map<string, Avaliacao[]>();
  for (const a of avaliacoes) {
    const lista = porLoja.get(a.lojaNome) ?? [];
    lista.push(a);
    porLoja.set(a.lojaNome, lista);
  }

  return Array.from(porLoja.entries()).map(([loja, lista]) => {
    const mediaGeral = lista.reduce((s, a) => s + a.notaFinalPonderada, 0) / lista.length;
    const ultimaAvaliacao = lista.reduce(
      (max, a) => (new Date(a.data) > new Date(max) ? a.data : max),
      lista[0].data
    );
    return {
      loja,
      mediaGeral,
      avaliacoes: lista.length,
      ultimaAvaliacao,
      statusMedio: statusFromWeighted(mediaGeral),
    };
  });
}

export interface MediaSecaoLoja {
  loja: string;
  secao: string;
  media: number;
}

/** Achata as médias por seção de cada avaliação em linhas (loja, seção,
 *  média) — replica o `rows.append(...)` da aba "Seções" do original.
 *  Precisa da função computeSectionScores (lib/calculations.ts) chamada
 *  por avaliação; recebe já o resultado pronto pra evitar dependência
 *  circular entre os dois arquivos. */
export function mediasPorSecaoELoja(
  avaliacoes: Avaliacao[],
  computeSectionScores: (secoes: Avaliacao["secoes"]) => Record<string, number>
): MediaSecaoLoja[] {
  const linhas: MediaSecaoLoja[] = [];
  for (const a of avaliacoes) {
    const scores = computeSectionScores(a.secoes);
    for (const [secao, media] of Object.entries(scores)) {
      linhas.push({ loja: a.lojaNome, secao, media });
    }
  }
  return linhas;
}

/** Média geral por seção (todas as lojas juntas) — para o gráfico de
 *  barras horizontal da aba "Seções". */
export function mediaGeralPorSecao(
  linhas: MediaSecaoLoja[]
): { secao: string; media: number }[] {
  const porSecao = new Map<string, { soma: number; count: number }>();
  for (const l of linhas) {
    const atual = porSecao.get(l.secao) ?? { soma: 0, count: 0 };
    atual.soma += l.media;
    atual.count += 1;
    porSecao.set(l.secao, atual);
  }
  return Array.from(porSecao.entries())
    .map(([secao, { soma, count }]) => ({ secao, media: soma / count }))
    .sort((a, b) => a.media - b.media);
}

/** Mapa de calor loja × seção: matriz [loja][secao] = média. */
export function mapaDeCalor(linhas: MediaSecaoLoja[]): {
  lojas: string[];
  secoes: string[];
  valores: Record<string, Record<string, number>>;
} {
  const lojas = Array.from(new Set(linhas.map((l) => l.loja))).sort();
  const secoes = Array.from(new Set(linhas.map((l) => l.secao)));
  const valores: Record<string, Record<string, number>> = {};

  for (const l of linhas) {
    valores[l.loja] = valores[l.loja] ?? {};
    valores[l.loja][l.secao] = l.media;
  }

  return { lojas, secoes, valores };
}

/** Os 6 piores pares loja×seção — replica "Pontos de atenção executivos". */
export function piorLojaSecao(linhas: MediaSecaoLoja[], top = 6): MediaSecaoLoja[] {
  return [...linhas].sort((a, b) => a.media - b.media).slice(0, top);
}

export interface EvolucaoMensal {
  mes: string;
  loja: string;
  media: number;
}

/** Média mensal por loja — para o comparativo mensal da aba "Evolução". */
export function evolucaoMensalPorLoja(avaliacoes: Avaliacao[]): EvolucaoMensal[] {
  const porMesLoja = new Map<string, { soma: number; count: number }>();
  for (const a of avaliacoes) {
    const mes = a.data.slice(0, 7); // YYYY-MM
    const chave = `${mes}__${a.lojaNome}`;
    const atual = porMesLoja.get(chave) ?? { soma: 0, count: 0 };
    atual.soma += a.notaFinalPonderada;
    atual.count += 1;
    porMesLoja.set(chave, atual);
  }
  return Array.from(porMesLoja.entries()).map(([chave, { soma, count }]) => {
    const [mes, loja] = chave.split("__");
    return { mes, loja, media: soma / count };
  });
}
