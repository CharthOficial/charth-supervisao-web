/**
 * Sugestões exibidas em cada Plano de Ação.
 *
 * ATENÇÃO: existe uma segunda biblioteca em config.py
 * (ACTION_PLAN_LIBRARY / ACTION_PLAN_SECTION_DEFAULTS / action_plan_recommendation,
 * com 5 campos: problema/impacto/ação/validação/prazo). Ela parece não
 * ser usada em lugar nenhum do código visto até agora. A função abaixo
 * (_action_suggestion em dashboard.py) é a que REALMENTE é chamada em
 * action_plans_page() e aparece na tela — por isso é esta que estou
 * portando, com só 2 campos (ação recomendada + evidência esperada).
 */

interface Sugestao {
  acao: string;
  evidencia: string;
}

const SUGESTOES_POR_PERGUNTA: Record<string, Sugestao> = {
  acuracidade_estoque_5_itens: {
    acao: "Recontar os 5 itens conferidos, registrar divergências entre físico e sistema, identificar a origem da diferença e solicitar ajuste ou correção do processo.",
    evidencia: "Registrar referência/código dos 5 itens, quantidade física, quantidade no sistema, diferença encontrada e ação tomada. Na próxima visita, repetir nova amostra para validar a correção.",
  },
  ruptura_best_sellers: {
    acao: "Levantar os best sellers ausentes, consultar disponibilidade em outras lojas ou estoque central e solicitar reposição ou transferência.",
    evidencia: "Registrar produto, cor/tamanho, quantidade faltante, loja origem/destino e data da solicitação de reposição ou transferência.",
  },
  transferencias_solicitadas_em_dia: {
    acao: "Revisar todas as transferências pendentes, separar o que depende da loja e o que depende de outra unidade, e atualizar a responsável pelo envio ou recebimento.",
    evidencia: "Registrar transferências em atraso, responsável, motivo do atraso e nova data combinada.",
  },
  reposicao_agil_salao: {
    acao: "Organizar uma rotina de conferência do salão por períodos do dia, definindo responsável para reposição rápida dos produtos vendidos ou provados.",
    evidencia: "Registrar horários de conferência, responsável e principais produtos repostos.",
  },
  estoque_organizado_limpo: {
    acao: "Reorganizar o estoque por categoria, coleção, tamanho e giro, eliminando acúmulos e deixando o acesso aos produtos mais vendidos mais rápido.",
    evidencia: "Enviar foto antes/depois e registrar responsáveis pela organização.",
  },
  pecas_defeito_separadas: {
    acao: "Separar imediatamente as peças com defeito, identificar o tipo de problema e definir destino: ajuste, troca, devolução ou baixa conforme orientação interna.",
    evidencia: "Registrar referência, quantidade, defeito identificado e destino definido.",
  },
  araras_penteadas: {
    acao: "Revisar todas as araras, padronizar espaçamento, sequência visual e apresentação das peças conforme orientação de VM.",
    evidencia: "Enviar foto após ajuste e registrar ponto da loja corrigido.",
  },
  vitrine_gera_desejo: {
    acao: "Reavaliar composição da vitrine, escolhendo looks com maior força comercial, melhor coordenação visual e clareza de proposta.",
    evidencia: "Enviar foto da vitrine ajustada e registrar peças foco utilizadas.",
  },
  preco_visivel_sem_poluicao: {
    acao: "Revisar etiquetas e comunicação de preço para garantir visibilidade sem excesso visual no salão.",
    evidencia: "Registrar pontos corrigidos e foto da área ajustada.",
  },
  manequins_bem_montados: {
    acao: "Recompor manequins com styling estratégico, priorizando peças foco, proporção, acabamento e desejo de compra.",
    evidencia: "Enviar foto dos manequins antes/depois e registrar peças utilizadas.",
  },
  meta_semanal_acompanhada: {
    acao: "Criar rotina diária de acompanhamento da meta semanal, com leitura do realizado, falta para bater e ação comercial do dia.",
    evidencia: "Registrar meta, realizado, diferença e ação definida para recuperação.",
  },
  gerente_plano_acao_abaixo_meta: {
    acao: "Formalizar plano de ação comercial quando a loja estiver abaixo da meta, com responsáveis, prazos e acompanhamento diário.",
    evidencia: "Registrar ação, responsável, prazo e resultado esperado.",
  },
  ticket_medio_meta: {
    acao: "Trabalhar composição de looks, venda adicional e argumentação de valor para elevar ticket médio.",
    evidencia: "Registrar estratégia aplicada e acompanhar ticket médio nos próximos dias.",
  },
  pa_meta: {
    acao: "Reforçar oferta de terceira peça, acessórios, variação de cor e complementos para elevar PA.",
    evidencia: "Registrar prática combinada com equipe e resultado acompanhado.",
  },
  conversao_monitorada: {
    acao: "Acompanhar fluxo, atendimentos e vendas por período para identificar horários de baixa conversão e agir com abordagem mais ativa.",
    evidencia: "Registrar conversão observada, horário crítico e ação definida.",
  },
  reuniao_diaria_registrada: {
    acao: "Implantar reunião rápida diária com meta, foco comercial, pontos de atenção e registro do combinado.",
    evidencia: "Registrar data, participantes e principais combinados.",
  },
  feedback_individual_mes: {
    acao: "Programar feedback individual com cada pessoa da equipe, conectando comportamento, resultado e plano de evolução.",
    evidencia: "Registrar data prevista, colaboradora e tema principal do feedback.",
  },
  plano_acao_documentado: {
    acao: "Documentar o plano de ação da loja com prioridade, responsável, prazo e status de acompanhamento.",
    evidencia: "Registrar plano, responsável e data da próxima validação.",
  },
};

/** Fallback por seção (substring match no nome da seção) — replica o
 *  encadeamento de `if "Estoque" in section / "Visual" in section / ...`
 *  de dashboard.py. */
function sugestaoPorSecao(secao: string): Sugestao {
  if (secao.includes("Estoque")) {
    return {
      acao: "Revisar o processo operacional relacionado ao ponto apontado, identificar causa da falha e definir responsável pela correção.",
      evidencia: "Registrar item/produto envolvido, causa provável, responsável e prazo de correção.",
    };
  }
  if (secao.includes("Visual")) {
    return {
      acao: "Revisar a execução visual no salão, corrigir apresentação e validar se o padrão de marca ficou claro para a cliente.",
      evidencia: "Enviar foto após a correção e registrar a área ajustada.",
    };
  }
  if (secao.includes("Resultados")) {
    return {
      acao: "Definir ação comercial objetiva para recuperar o indicador, com acompanhamento diário pela gerente.",
      evidencia: "Registrar indicador impactado, ação definida, responsável e evolução esperada.",
    };
  }
  if (secao.includes("Gestão")) {
    return {
      acao: "Formalizar rotina de gestão para o ponto indicado, com combinado claro, responsável e acompanhamento na próxima visita.",
      evidencia: "Registrar combinado, responsável e data da próxima checagem.",
    };
  }
  return {
    acao: "", // preenchido dinamicamente com o label da pergunta, ver função abaixo
    evidencia: "Registrar o que foi feito, quem ficou responsável e como será validado na próxima visita.",
  };
}

/** Sugestão de ação + evidência para um item de Plano de Ação — replica
 *  _action_suggestion() de src/dashboard.py exatamente. */
export function actionSuggestion(
  perguntaKey: string,
  secao: string,
  perguntaLabel: string
): Sugestao {
  const especifica = SUGESTOES_POR_PERGUNTA[perguntaKey];
  if (especifica) return especifica;

  const porSecao = sugestaoPorSecao(secao);
  if (porSecao.acao) return porSecao;

  return {
    acao: `Tratar o ponto indicado: ${perguntaLabel}. Definir causa, responsável, prazo e evidência de correção.`,
    evidencia: porSecao.evidencia,
  };
}
