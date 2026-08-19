import { FORM_SECTIONS } from "./formConfig";
import { actionPriority, defaultActionDeadlineDays } from "./calculations";
import { actionPlanRecommendation } from "./actionPlanLibrary";
import type { Avaliacao, PlanoAcao } from "./types";

/**
 * Gera um PlanoAcao (sem id) para cada pergunta com nota abaixo do
 * padrão — replica build_action_plan_items() de src/db.py exatamente:
 *
 *   if score < 7 or (is_binary and score == 0):
 *
 * (limiar estrito "< 7", confirmado — eu tinha assumido "≤ 7" antes de
 * ver este arquivo, o que estava errado).
 *
 * Prazo: usa deadlineDays do template de actionPlanLibrary.ts quando
 * disponível; senão cai para defaultActionDeadlineDays (replica
 * `template.get("deadline_days") or default_action_deadline_days(...)`).
 * Responsável: gerente da loja por padrão, igual ao original
 * (`data.get("manager") or "Gerente de Loja"`).
 */
export function gerarPlanosDeAcao(
  avaliacaoId: string,
  avaliacao: Pick<Avaliacao, "lojaId" | "secoes" | "data" | "gerente">
): Omit<PlanoAcao, "id">[] {
  const planos: Omit<PlanoAcao, "id">[] = [];

  for (const secaoConfig of FORM_SECTIONS) {
    const respostas = avaliacao.secoes[secaoConfig.name]?.respostas ?? {};

    for (const pergunta of secaoConfig.questions) {
      // Default 10 quando a pergunta não foi respondida — replica
      // `scores.get(key, 10)` do original.
      const nota = respostas[pergunta.key] ?? 10;
      const isBinary = pergunta.type === "binary" || pergunta.type === "binary_inverse";

      const geraPendencia = nota < 7 || (isBinary && nota === 0);
      if (!geraPendencia) continue;

      const template = actionPlanRecommendation(secaoConfig.name, pergunta.key, pergunta.label);
      const dias = template.deadlineDays ?? defaultActionDeadlineDays(nota, isBinary);
      const prazo = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      planos.push({
        avaliacaoId,
        lojaId: avaliacao.lojaId,
        secao: secaoConfig.name,
        perguntaKey: pergunta.key,
        perguntaLabel: pergunta.label,
        nota,
        prioridade: actionPriority(nota, isBinary),
        responsavel: avaliacao.gerente || "Gerente de Loja",
        prazo,
        status: "Aberto",
        observacoes: "Plano de ação gerado automaticamente por nota abaixo do padrão.",
        problema: template.problem,
        impacto: template.impact,
        acaoRecomendada: template.recommendedAction,
        criterioValidacao: template.validation,
        criadoEm: avaliacao.data,
      });
    }
  }

  return planos;
}
