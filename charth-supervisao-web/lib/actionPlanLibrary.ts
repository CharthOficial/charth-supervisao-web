/**
 * Portado de config.py: ACTION_PLAN_SECTION_DEFAULTS + ACTION_PLAN_LIBRARY
 * + action_plan_recommendation(). Confirmado em db.py (build_action_plan_items)
 * que isto é usado na CRIAÇÃO do plano — os 4 campos aqui (problema/
 * impacto/ação/validação) são salvos no documento.
 *
 * IMPORTANTE: isto é DIFERENTE da sugestão exibida na tela
 * (lib/actionSuggestions.ts, portada de _action_suggestion em
 * dashboard.py). O app original salva estes campos mas não os exibe —
 * a tela mostra a sugestão de actionSuggestions.ts, calculada de novo.
 * Ambos existem no rebuild, replicando essa duplicação real.
 */

interface TemplatePlano {
  problem: string;
  impact: string;
  recommendedAction: string;
  validation: string;
  deadlineDays: number;
}

const SECTION_DEFAULTS: Record<string, Partial<TemplatePlano>> = {
  "Equipe e Atendimento": {
    problem: "Ponto de atendimento abaixo do padrão esperado.",
    impact: "Pode reduzir conversão, vínculo com a cliente, venda adicional e consistência da experiência em loja.",
    recommendedAction: "Realizar alinhamento com a equipe, observar atendimentos reais no salão e reforçar o comportamento esperado no início de cada turno.",
    validation: "Validar por observação direta da gerente ou supervisora e registrar evidências de melhoria no próximo acompanhamento.",
    deadlineDays: 7,
  },
  "Visual Merchandising": {
    problem: "Execução visual abaixo do padrão esperado.",
    impact: "Compromete leitura de produto, desejo de compra e percepção de cuidado da loja.",
    recommendedAction: "Reorganizar o ponto identificado conforme orientação de VM, priorizando clareza visual, exposição comercial e padrão premium.",
    validation: "Enviar foto da correção ou validar na próxima visita de supervisão.",
    deadlineDays: 2,
  },
  "Estoque e Produto": {
    problem: "Rotina de estoque/produto abaixo do padrão esperado.",
    impact: "Pode afetar venda, reposição, transferências, disponibilidade de produto e confiança da equipe nas informações do estoque.",
    recommendedAction: "Revisar a causa do desvio, organizar a rotina com a gerente e registrar os ajustes necessários para correção.",
    validation: "Conferir novamente o ponto na próxima visita ou por evidência enviada pela loja.",
    deadlineDays: 3,
  },
  "Resultados e Indicadores": {
    problem: "Rotina comercial ou acompanhamento de indicadores abaixo do padrão.",
    impact: "Reduz velocidade de reação da loja e pode comprometer meta, PA, ticket médio e conversão.",
    recommendedAction: "Definir plano comercial objetivo com meta do dia, foco de venda, acompanhamento por vendedora e ação de recuperação quando necessário.",
    validation: "Verificar registro do plano e evolução dos indicadores nos dias seguintes.",
    deadlineDays: 2,
  },
  "Experiência da Cliente e Padrão Premium": {
    problem: "Entrega da experiência da cliente ou padrão premium abaixo do esperado.",
    impact: "Pode reduzir encantamento, percepção de exclusividade e consistência do DNA CHARTH.",
    recommendedAction: "Reforçar com a equipe o ritual de atendimento, conferir disponibilidade dos itens de experiência e garantir execução durante o atendimento.",
    validation: "Validar por observação do atendimento, evidência física ou nova checagem na próxima visita.",
    deadlineDays: 3,
  },
  "WhatsApp e Vendas Digitais": {
    problem: "Rotina de WhatsApp/vendas digitais abaixo do padrão esperado.",
    impact: "Pode reduzir conversão digital, relacionamento com cliente e recuperação de oportunidades de venda.",
    recommendedAction: "Definir responsável por turno, rotina de checagem, busca ativa e acompanhamento das conversas pendentes.",
    validation: "Conferir amostra de conversas, tempo de resposta, contatos ativos e vendas geradas pelo canal.",
    deadlineDays: 7,
  },
  "Gestão da Gerente": {
    problem: "Rotina de liderança ou gestão abaixo do padrão esperado.",
    impact: "Afeta disciplina operacional, execução da equipe, reação aos resultados e consistência da cultura de loja.",
    recommendedAction: "Alinhar com a gerente uma rotina clara de reunião, acompanhamento, registro de ações e cobrança dos combinados.",
    validation: "Conferir registros, evidências de acompanhamento e evolução do comportamento da equipe.",
    deadlineDays: 7,
  },
  "Estrutura da Loja": {
    problem: "Estrutura física ou ambiente da loja fora do padrão esperado.",
    impact: "Pode comprometer experiência da cliente, segurança, operação e percepção premium da marca.",
    recommendedAction: "Registrar o ponto com evidência, acionar o responsável pela correção e acompanhar até a solução final.",
    validation: "Validar por foto, ordem de manutenção concluída ou nova checagem presencial.",
    deadlineDays: 7,
  },
};

const QUESTION_LIBRARY: Record<string, Partial<TemplatePlano>> = {
  atendimento_consultivo: {
    problem: "Atendimento pouco consultivo ou sem escuta ativa suficiente.",
    impact: "A cliente pode perceber o atendimento como operacional, reduzindo vínculo, conversão e venda adicional.",
    recommendedAction: "Realizar alinhamento com a equipe sobre abordagem consultiva, escuta ativa e perguntas-chave para entender ocasião de uso, preferência, necessidade e objeções da cliente.",
    validation: "Observar atendimentos reais no salão e registrar se a equipe aplicou perguntas consultivas durante a venda.",
    deadlineDays: 7,
  },
  oferecem_look_completo: {
    problem: "A equipe não está oferecendo composição completa de look.",
    impact: "Reduz PA, ticket médio e percepção de curadoria da marca.",
    recommendedAction: "Definir combinações de looks por coleção/semana e orientar a equipe a apresentar pelo menos uma peça complementar no atendimento.",
    validation: "Acompanhar atendimentos e verificar se houve oferta de segunda peça, acessório ou variação de cor.",
    deadlineDays: 7,
  },
  clima_organizacional: {
    problem: "Clima da equipe não favorece colaboração, respeito ou boa convivência.",
    impact: "Pode prejudicar energia de salão, atendimento, produtividade e retenção da equipe.",
    recommendedAction: "Realizar conversa estruturada com a gerente, identificar pontos de tensão e combinar ações objetivas de rotina, comunicação e postura entre a equipe.",
    validation: "Reavaliar o clima em nova visita e observar se houve melhora na colaboração durante o atendimento.",
    deadlineDays: 7,
  },
  pecas_semana_evidenciadas: {
    problem: "Peças foco da semana não estão em destaque no salão.",
    impact: "A loja perde força comercial nos produtos prioritários e reduz a conexão entre estratégia da semana e exposição visual.",
    recommendedAction: "Reposicionar as peças foco em pontos de maior visibilidade, como vitrine, mesa, araras de entrada ou manequins, conforme orientação de VM.",
    validation: "Enviar foto da nova exposição e confirmar se as peças foco estão visíveis para a cliente.",
    deadlineDays: 2,
  },
  araras_penteadas: {
    problem: "Araras sem organização visual adequada.",
    impact: "A desorganização reduz percepção de cuidado, dificulta leitura de produto e compromete o padrão premium da loja.",
    recommendedAction: "Reorganizar araras por categoria, cor, tamanho ou orientação de VM, garantindo espaçamento, alinhamento e leitura limpa.",
    validation: "Validar por foto ou na próxima visita da supervisora.",
    deadlineDays: 2,
  },
  vitrine_gera_desejo: {
    problem: "Vitrine não está gerando desejo real de compra.",
    impact: "Reduz atração de entrada, percepção de novidade e força comercial da loja.",
    recommendedAction: "Revisar composição da vitrine com foco em produto estratégico, styling, leitura de coleção e clareza visual.",
    validation: "Registrar foto da vitrine após ajuste e acompanhar percepção da supervisora/gestora.",
    deadlineDays: 2,
  },
  acuracidade_estoque_5_itens: {
    problem: "Divergência de acuracidade entre estoque físico e sistema na conferência de 5 itens aleatórios.",
    impact: "Afeta venda, transferência, reposição, inventário e confiança da equipe nas informações do estoque.",
    recommendedAction: "Recontar os itens divergentes, verificar possíveis causas como troca de referência, venda não baixada, transferência pendente ou peça em local incorreto, e solicitar ajuste quando necessário.",
    validation: "Realizar nova conferência de 5 itens aleatórios e registrar se houve correção da divergência.",
    deadlineDays: 2,
  },
  ruptura_best_sellers: {
    problem: "Ruptura de produtos com alto potencial de venda.",
    impact: "A loja perde oportunidade comercial e pode frustrar clientes com demanda ativa.",
    recommendedAction: "Listar os best sellers em ruptura, consultar disponibilidade em outras lojas/estoque central e solicitar reposição ou transferência.",
    validation: "Confirmar chegada, exposição ou alternativa comercial para os itens críticos.",
    deadlineDays: 3,
  },
  transferencias_solicitadas_em_dia: {
    problem: "Transferências pendentes ou fora do prazo.",
    impact: "Atrasos em transferência prejudicam reposição, atendimento à cliente e giro de produto entre lojas.",
    recommendedAction: "Revisar transferências abertas, identificar pendências, priorizar itens ligados a venda ou best sellers e alinhar envio/recebimento com a equipe responsável.",
    validation: "Conferir se as transferências foram baixadas, enviadas ou recebidas corretamente.",
    deadlineDays: 3,
  },
  time_conhece_meta_diaria: {
    problem: "Equipe sem clareza da meta diária.",
    impact: "Sem meta visível, a equipe perde referência de ritmo, foco e prioridade comercial.",
    recommendedAction: "Implantar rotina de abertura do dia com comunicação da meta diária, venda realizada, falta para meta e estratégia principal do dia.",
    validation: "Perguntar à equipe a meta do dia e verificar se todas sabem responder.",
    deadlineDays: 2,
  },
  gerente_plano_acao_abaixo_meta: {
    problem: "Ausência de plano de reação quando a loja está abaixo da meta.",
    impact: "A loja perde velocidade de correção e pode acumular desvio de resultado ao longo da semana.",
    recommendedAction: "Gerente deve registrar ações comerciais objetivas para recuperar performance, como carteira de clientes, WhatsApp ativo, foco em PA, looks estratégicos e acompanhamento por vendedora.",
    validation: "Verificar plano escrito e acompanhar evolução dos indicadores após a ação.",
    deadlineDays: 2,
  },
  cliente_sugestao_variedade_cor: {
    problem: "A equipe não apresenta variações de cor durante o atendimento.",
    impact: "Reduz possibilidade de escolha, venda adicional e percepção de curadoria personalizada.",
    recommendedAction: "Orientar a equipe a apresentar opções de cor quando houver disponibilidade, explicando ocasião de uso, combinação e diferença de proposta entre as variações.",
    validation: "Observar atendimentos e verificar se a sugestão de cor passou a fazer parte da abordagem.",
    deadlineDays: 7,
  },
  bala_charth_disponivel: {
    problem: "Item de experiência premium indisponível ou não oferecido.",
    impact: "A loja deixa de entregar elementos de hospitalidade que reforçam cuidado, encantamento e diferenciação da marca.",
    recommendedAction: "Conferir estoque dos itens de experiência, organizar armazenamento e orientar equipe sobre oferta ativa durante atendimento.",
    validation: "Validar disponibilidade física e se a equipe oferece os itens à cliente.",
    deadlineDays: 2,
  },
  brigadeiro_charth_disponivel: {
    problem: "Item de experiência premium indisponível ou não oferecido.",
    impact: "A loja deixa de entregar elementos de hospitalidade que reforçam cuidado, encantamento e diferenciação da marca.",
    recommendedAction: "Conferir estoque dos itens de experiência, organizar armazenamento e orientar equipe sobre oferta ativa durante atendimento.",
    validation: "Validar disponibilidade física e se a equipe oferece os itens à cliente.",
    deadlineDays: 2,
  },
  bebidas_personalizadas_disponiveis: {
    problem: "Bebidas personalizadas indisponíveis ou não oferecidas.",
    impact: "Reduz a percepção de hospitalidade e cuidado extra no atendimento.",
    recommendedAction: "Conferir disponibilidade, armazenamento e rotina de oferta das bebidas personalizadas durante o atendimento.",
    validation: "Validar disponibilidade física e abordagem da equipe.",
    deadlineDays: 2,
  },
  responde_ate_10_min: {
    problem: "Tempo de resposta do WhatsApp acima do padrão esperado.",
    impact: "A demora reduz conversão, enfraquece relacionamento e pode fazer a cliente comprar em outro canal.",
    recommendedAction: "Definir responsável por turno, acompanhar conversas pendentes e estabelecer rotina de checagem do WhatsApp em horários fixos.",
    validation: "Verificar tempo médio de resposta e amostra de conversas recentes.",
    deadlineDays: 3,
  },
  busca_ativa_whatsapp: {
    problem: "Busca ativa insuficiente pelo WhatsApp.",
    impact: "A loja deixa de gerar venda a partir da carteira de clientes e perde oportunidade de ativar relacionamento.",
    recommendedAction: "Criar rotina semanal de contatos com clientes, usando novidades, reposições, peças foco e oportunidades personalizadas.",
    validation: "Conferir quantidade de contatos feitos, respostas recebidas e vendas geradas pelo canal.",
    deadlineDays: 7,
  },
  reuniao_diaria_registrada: {
    problem: "Rotina de reunião diária sem execução ou sem registro.",
    impact: "A equipe perde alinhamento sobre meta, prioridades, foco comercial e combinados do dia.",
    recommendedAction: "Implantar reunião rápida diária com registro de meta, foco do dia, ponto de atenção e responsáveis por ação.",
    validation: "Conferir registro da reunião e perguntar à equipe sobre os direcionamentos do dia.",
    deadlineDays: 2,
  },
  plano_acao_documentado: {
    problem: "Plano de ação não documentado.",
    impact: "Sem registro, a correção depende de memória e não permite acompanhamento consistente.",
    recommendedAction: "Registrar plano com problema, ação, responsável, prazo e evidência esperada de conclusão.",
    validation: "Supervisora confere plano registrado e evolução na próxima visita.",
    deadlineDays: 2,
  },
  lampadas_queimadas: {
    problem: "Lâmpadas queimadas ou iluminação fora do padrão.",
    impact: "Compromete visual merchandising, percepção de cuidado e valorização dos produtos.",
    recommendedAction: "Registrar pontos com lâmpadas queimadas, acionar manutenção ou responsável interno e acompanhar substituição.",
    validation: "Enviar foto após correção ou validar na próxima visita.",
    deadlineDays: 7,
  },
  moveis_equipamentos_danificados: {
    problem: "Móveis ou equipamentos danificados na loja.",
    impact: "Afeta experiência da cliente, segurança, operação e percepção de padrão premium.",
    recommendedAction: "Registrar item danificado com foto, avaliar risco operacional e acionar manutenção, troca ou reparo.",
    validation: "Confirmar reparo realizado ou previsão formal de solução.",
    deadlineDays: 7,
  },
};

const GENERIC_DEFAULTS: TemplatePlano = {
  problem: "",
  impact: "Pode comprometer a operação, a experiência da cliente ou a execução do padrão CHARTH.",
  recommendedAction: "Analisar a causa com a gerente, definir ação objetiva, responsável e prazo para correção.",
  validation: "Validar a correção na próxima visita ou por evidência enviada pela loja.",
  deadlineDays: 7,
};

/** Replica action_plan_recommendation() de config.py — usada na criação
 *  do plano (campos salvos, não necessariamente exibidos, ver nota no
 *  topo do arquivo). */
export function actionPlanRecommendation(
  sectionName: string,
  questionKey: string,
  questionLabel: string
): TemplatePlano {
  const sectionDefault = SECTION_DEFAULTS[sectionName] ?? {};
  const specific = QUESTION_LIBRARY[questionKey] ?? {};
  const merged = { ...sectionDefault, ...specific };

  return {
    problem: merged.problem || `Ponto abaixo do padrão: ${questionLabel}`,
    impact: merged.impact || GENERIC_DEFAULTS.impact,
    recommendedAction: merged.recommendedAction || GENERIC_DEFAULTS.recommendedAction,
    validation: merged.validation || GENERIC_DEFAULTS.validation,
    deadlineDays: merged.deadlineDays ?? GENERIC_DEFAULTS.deadlineDays,
  };
}
