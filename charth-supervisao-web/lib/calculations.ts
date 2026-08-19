import { WEIGHTS, BONUS_CONFIG, FORM_SECTIONS } from "./formConfig";
import type { Avaliacao, RespostaDeSecao } from "./types";

/** Média simples, arredondada a 2 casas — replica mean() do original. */
function mean(valores: number[]): number {
  if (valores.length === 0) return 0;
  const soma = valores.reduce((s, v) => s + v, 0);
  return Math.round((soma / valores.length) * 100) / 100;
}

/**
 * Média de cada uma das 8 seções de FORM_SECTIONS — replica
 * compute_section_scores(). Só considera perguntas que a seção
 * realmente tem (evita contar campos de outra seção por engano).
 */
export function computeSectionScores(
  secoes: Record<string, RespostaDeSecao>
): Record<string, number> {
  const resultado: Record<string, number> = {};

  for (const secaoConfig of FORM_SECTIONS) {
    const respostas = secoes[secaoConfig.name]?.respostas ?? {};
    const valores = secaoConfig.questions
      .filter((q) => q.key in respostas)
      .map((q) => respostas[q.key]);
    resultado[secaoConfig.name] = mean(valores);
  }

  return resultado;
}

/**
 * Média ponderada principal — replica compute_weighted_score() exatamente:
 *
 *   ((Equipe x1) + (VM x1) + (Estoque x1) + (Resultados x2)
 *    + (Experiência da Cliente e Padrão Premium x1) + (Gestão x2)) / 8
 *
 * WhatsApp e Estrutura da Loja ficam fora desta conta.
 */
export function computeWeightedScore(sectionScores: Record<string, number>): number {
  const totalWeight = Object.values(WEIGHTS).reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return 0;

  let total = 0;
  for (const [secao, peso] of Object.entries(WEIGHTS)) {
    total += (sectionScores[secao] ?? 0) * peso;
  }

  return Math.round((total / totalWeight) * 100) / 100;
}

/** Atalho: calcula a média ponderada direto de uma Avaliacao completa. */
export function calcularMediaPonderada(avaliacao: Avaliacao): number {
  const sectionScores = computeSectionScores(avaliacao.secoes);
  return computeWeightedScore(sectionScores);
}

/** Status operacional oficial — replica status_from_weighted() exatamente. */
export function statusFromWeighted(score: number): string {
  if (score >= 9.0) return "Excelência CHARTH";
  if (score >= 8.0) return "Loja Forte";
  if (score >= 7.0) return "Loja em Atenção";
  return "Plano de Ação Imediato";
}

/** Status + cor de UMA nota individual (pergunta de escala ou média de
 *  seção) — replica score_status() de calculations.py.
 *
 *  ATENÇÃO: confirmado em src/dashboard.py que esta função NÃO é
 *  importada lá (`from .calculations import result_meta_reference,
 *  status_from_weighted` — sem score_status). Ou seja, é bem provável
 *  que esta função também seja código não utilizado, superseded por
 *  scoreBadgeDashboard() abaixo, que é a versão realmente renderizada
 *  na tela (Histórico e Planos de Ação). Mantida aqui por fidelidade,
 *  não use para exibição real. */
export function scoreStatus(score: number | null | undefined): { label: string; color: string } {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return { label: "Não avaliado", color: "#9FA0A3" };
  }
  if (score <= 4) return { label: "Crítico", color: "#9E3F45" };
  if (score <= 6) return { label: "Atenção", color: "#B8875D" };
  if (score === 7) return { label: "Regular", color: "#B7A86A" };
  if (score <= 9) return { label: "Forte", color: "#6D6E71" };
  return { label: "Excelência Charth", color: "#C9A0A0" };
}

/** Badge de nota REALMENTE usado nas telas (Histórico, Planos de Ação)
 *  — replica a função local `_score_badge` de src/dashboard.py (a
 *  segunda definição no arquivo, que sobrescreve a primeira — o próprio
 *  código original tem 2 versões desta função). Use esta, não
 *  scoreStatus() acima, ao exibir nota de seção/pergunta na tela. */
export function scoreBadgeDashboard(score: number): { label: string; color: string } {
  if (score >= 9) return { label: "Excelência", color: "#C9A0A0" };
  if (score >= 8) return { label: "Forte", color: "#C8A24A" };
  if (score >= 7) return { label: "Regular", color: "#A66A3F" };
  if (score >= 5) return { label: "Atenção", color: "#B8875D" };
  return { label: "Crítico", color: "#7F3438" };
}

/** Referência textual da meta de Resultados — replica result_meta_reference(). */
export function resultMetaReference(resultScore: number): string {
  if (resultScore >= 10) return "105% ou mais da meta";
  if (resultScore >= 9) return "100% da meta";
  if (resultScore >= 8.5) return "mínimo de 95% da meta";
  if (resultScore >= 8.3) return "mínimo de 90% da meta";
  return "abaixo dos critérios mínimos de meta";
}

/** Valor do bônus Ouro da gerente, escalonado pela nota — replica
 *  manager_gold_value(). */
export function managerGoldValue(weightedScore: number): number {
  if (weightedScore >= 9.5) return 5000.0;
  if (weightedScore >= 9.0) return 4200.0;
  if (weightedScore >= 8.5) return 3500.0;
  return 0.0;
}

export interface ResultadoBonus {
  level: "Ouro" | "Prata" | "Bronze" | "Sem bônus";
  managerBonus: number;
  teamFundEnabled: boolean;
  reason: string;
}

/**
 * Bônus por avaliação individual — replica compute_bonus() exatamente,
 * usando BONUS_CONFIG (não BONUS_RULES — ver nota em formConfig.ts).
 *
 * NOTA do código original: "Mantido por compatibilidade com versões
 * antigas. O formulário corrigido não exibe mais bonificação." — ou
 * seja, o app atual provavelmente não chama isto ao salvar uma
 * avaliação (por isso `avaliacao.bonus` é salvo vazio), mas a função
 * pode ser usada em outro lugar (ex: uma tela de relatório).
 */
export function computeBonus(
  sectionScores: Record<string, number>,
  weightedScore: number,
  graveIssue: boolean
): ResultadoBonus {
  const cfg = BONUS_CONFIG;
  const resultScore = sectionScores["Resultados e Indicadores"] ?? 0;
  const managementScore = sectionScores["Gestão da Gerente"] ?? 0;

  // min_block considera só as 6 seções ponderadas (WEIGHTS), não as 8.
  const weightedBlocks = Object.keys(WEIGHTS).map((secao) => sectionScores[secao] ?? 0);
  const minBlock = weightedBlocks.length > 0 ? Math.min(...weightedBlocks) : 0;

  const gold = cfg.gold;
  const qualifiesGold =
    weightedScore >= gold.minWeightedScore &&
    resultScore >= gold.minResults &&
    managementScore >= gold.minManagement &&
    minBlock >= gold.minBlock &&
    (!gold.requiresNoGraveDisciplinaryIssue || !graveIssue);

  if (qualifiesGold) {
    return {
      level: "Ouro",
      managerBonus: managerGoldValue(weightedScore),
      teamFundEnabled: true,
      reason: "Critérios Ouro atendidos: média, resultado, gestão, blocos mínimos e sem falta grave.",
    };
  }

  const silver = cfg.silver;
  const qualifiesSilver =
    weightedScore >= silver.minWeightedScore &&
    resultScore >= silver.minResults &&
    managementScore >= silver.minManagement &&
    minBlock >= silver.minBlock;

  if (qualifiesSilver) {
    return {
      level: "Prata",
      managerBonus: silver.managerValue,
      teamFundEnabled: false,
      reason: "Critérios Prata atendidos. Equipe sem premiação financeira nesta regra.",
    };
  }

  if (weightedScore >= cfg.bronzeMinWeightedScore) {
    return {
      level: "Bronze",
      managerBonus: cfg.bronzeManagerValueOption,
      teamFundEnabled: false,
      reason:
        "Bronze aplicado por critério configurável; briefing não definiu critérios completos de Bronze.",
    };
  }

  return {
    level: "Sem bônus",
    managerBonus: 0.0,
    teamFundEnabled: false,
    reason: "Critérios mínimos de bonificação não atingidos.",
  };
}

/** Prioridade sugerida para item de Plano de Ação — replica action_priority(). */
export function actionPriority(score: number, isBinary = false): "Alta" | "Média" | "Baixa" | "Monitoramento" {
  if (score <= 4 || (isBinary && score === 0)) return "Alta";
  if (score <= 6) return "Média";
  if (score <= 7) return "Baixa";
  return "Monitoramento";
}

/** Prazo padrão (em dias) sugerido para o item — replica
 *  default_action_deadline_days(). */
export function defaultActionDeadlineDays(score: number, isBinary = false): number {
  if (score <= 4 || (isBinary && score === 0)) return 2;
  if (score <= 6) return 7;
  return 14;
}
