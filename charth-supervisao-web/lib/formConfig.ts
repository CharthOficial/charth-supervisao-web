// Espelha src/config.py do projeto original.
// Qualquer mudança de pergunta, peso ou loja deve ser feita AQUI, não
// espalhada pelos componentes — é assim que o app original funciona
// (FORM_SECTIONS é lido dinamicamente por src/forms.py).

export const APP_NAME = "CHARTH – Supervisão Varejo";

export const STORES = ["Cidade Jardim", "Vila da Serra", "Diamond", "Barigui"] as const;
export const MANAGERS = ["Natasha", "Jéssica", "Ingrid", "Fernanda"] as const;

export const ROLE_ADMIN = "admin";
export const ROLE_SUPERVISORA = "supervisora";
export const ROLE_GESTORA = "gestora";

// Valor real do config.py original — gestora vê todas as lojas por padrão.
export const GESTORA_CAN_VIEW_ALL_STORES = true;

// Pesos da média ponderada principal (soma = 8, usada como denominador).
export const WEIGHTS: Record<string, number> = {
  "Equipe e Atendimento": 1,
  "Visual Merchandising": 1,
  "Estoque e Produto": 1,
  "Resultados e Indicadores": 2,
  "Experiência da Cliente e Padrão Premium": 1,
  "Gestão da Gerente": 2,
};

// Aparecem no formulário e no dashboard, mas NÃO entram na média ponderada.
export const NON_WEIGHTED_SECTIONS = ["WhatsApp e Vendas Digitais", "Estrutura da Loja"];

export type TipoPergunta = "score" | "binary" | "binary_inverse";

export interface Pergunta {
  key: string;
  label: string;
  type: TipoPergunta;
}

export interface FormSectionConfig {
  name: string;
  observationKey: string;
  photoKey?: string;
  questions: Pergunta[];
}

// Conteúdo real das 8 seções ponderáveis/não-ponderáveis (Identificação e
// Perguntas Estratégicas são tratadas separadamente, fora desta lista —
// igual ao app original, onde FORM_SECTIONS não inclui essas duas).
export const FORM_SECTIONS: FormSectionConfig[] = [
  {
    name: "Equipe e Atendimento",
    observationKey: "observacoes_equipe_atendimento",
    questions: [
      { key: "postura_uniforme_apresentacao", label: "A equipe está com postura, uniforme e apresentação pessoal adequados?", type: "score" },
      { key: "atendimento_consultivo", label: "A equipe pratica atendimento consultivo, com escuta ativa e solução?", type: "score" },
      { key: "oferecem_look_completo", label: "A equipe oferece look completo, estimulando venda adicional?", type: "score" },
      { key: "atendimento_personalizado", label: "A equipe realiza atendimento personalizado, chamando a cliente pelo nome?", type: "score" },
      { key: "senso_de_dono", label: "A equipe demonstra senso de dono na rotina da loja?", type: "score" },
      { key: "equipe_engajada_salao", label: "A equipe está engajada no salão, com energia ativa?", type: "score" },
      { key: "clima_organizacional", label: "O clima entre a equipe favorece colaboração, respeito e boa convivência?", type: "score" },
    ],
  },
  {
    name: "Visual Merchandising",
    observationKey: "observacoes_vm",
    photoKey: "foto_vm",
    questions: [
      { key: "pecas_semana_evidenciadas", label: "As peças da semana estão evidenciadas?", type: "binary" },
      { key: "preco_visivel_sem_poluicao", label: "Os preços estão visíveis, sem poluição visual?", type: "binary" },
      { key: "manequins_bem_montados", label: "Os manequins estão bem montados, com styling estratégico?", type: "binary" },
      { key: "vitrine_gera_desejo", label: "A vitrine gera desejo real de compra?", type: "binary" },
      { key: "pecas_passadas_repostas", label: "As peças estão bem passadas e repostas?", type: "binary" },
      { key: "araras_penteadas", label: "As araras estão penteadas?", type: "binary" },
    ],
  },
  {
    name: "Estoque e Produto",
    observationKey: "observacoes_estoque_produto",
    photoKey: "foto_estoque_produto",
    questions: [
      { key: "estoque_organizado_limpo", label: "O estoque está organizado e limpo?", type: "binary" },
      { key: "reposicao_agil_salao", label: "A reposição no salão está sendo feita com agilidade?", type: "binary" },
      { key: "ruptura_best_sellers", label: "A loja está sem ruptura de best sellers?", type: "binary" },
      { key: "pecas_defeito_separadas", label: "As peças com defeito estão separadas corretamente?", type: "binary" },
      { key: "transferencias_solicitadas_em_dia", label: "As transferências solicitadas estão em dia?", type: "binary" },
      { key: "acuracidade_estoque_5_itens", label: "A conferência de 5 itens aleatórios apresentou acuracidade entre estoque físico e sistema?", type: "binary" },
    ],
  },
  {
    name: "Resultados e Indicadores",
    observationKey: "observacoes_resultados",
    questions: [
      { key: "time_conhece_meta_diaria", label: "A equipe conhece a meta diária?", type: "binary" },
      { key: "meta_semanal_acompanhada", label: "A meta semanal é acompanhada diariamente?", type: "binary" },
      { key: "gerente_plano_acao_abaixo_meta", label: "A gerente apresenta plano de ação quando a loja está abaixo da meta?", type: "binary" },
      { key: "ticket_medio_meta", label: "O ticket médio está dentro da meta?", type: "binary" },
      { key: "pa_meta", label: "O produto por atendimento (PA) está dentro da meta?", type: "binary" },
      { key: "conversao_monitorada", label: "A conversão é monitorada diariamente?", type: "binary" },
    ],
  },
  {
    name: "Experiência da Cliente e Padrão Premium",
    observationKey: "observacoes_experiencia_cliente_premium",
    questions: [
      { key: "loja_limpa", label: "A loja está limpa, incluindo salão, provadores e caixa?", type: "binary" },
      { key: "provadores_impecaveis", label: "Os provadores estão impecáveis?", type: "binary" },
      { key: "cliente_sugestao_look", label: "A cliente recebe sugestão de look completo?", type: "binary" },
      { key: "cliente_sugestao_variedade_cor", label: "A cliente recebe sugestão de variedade de cor?", type: "binary" },
      { key: "embalagem_padrao_charth", label: "A embalagem está alinhada ao padrão Charth?", type: "binary" },
      { key: "bala_charth_disponivel", label: "A bala Charth está disponível?", type: "binary" },
      { key: "brigadeiro_charth_disponivel", label: "O brigadeiro Charth está disponível?", type: "binary" },
      { key: "bebidas_personalizadas_disponiveis", label: "As bebidas personalizadas estão disponíveis?", type: "binary" },
      { key: "personalizados_armazenados", label: "Os personalizados estão armazenados corretamente?", type: "binary" },
      { key: "itens_oferecidos_ativamente", label: "Os itens de experiência são oferecidos ativamente?", type: "binary" },
      { key: "servico_elegancia", label: "O serviço é feito com elegância, usando bandeja ou apresentação adequada?", type: "binary" },
      { key: "experiencia_exclusividade", label: "A experiência transmite exclusividade?", type: "binary" },
      { key: "insumos_adequados", label: "Todos os insumos estão adequados?", type: "binary" },
    ],
  },
  {
    name: "WhatsApp e Vendas Digitais",
    observationKey: "observacoes_whatsapp",
    questions: [
      { key: "responde_ate_10_min", label: "As mensagens são respondidas em até 10 minutos?", type: "binary" },
      { key: "responsavel_turno_whatsapp", label: "Existe responsável definido por turno para o WhatsApp?", type: "binary" },
      { key: "conversas_organizadas", label: "As conversas estão organizadas e acompanhadas?", type: "binary" },
      { key: "fotos_padrao_charth", label: "As fotos seguem o padrão Charth?", type: "binary" },
      { key: "busca_ativa_whatsapp", label: "A loja realiza busca ativa via WhatsApp?", type: "binary" },
      { key: "novidades_semanais", label: "A loja envia novidades semanalmente?", type: "binary" },
      { key: "pos_venda_whatsapp_24h", label: "O pós-venda via WhatsApp é feito em até 24h?", type: "binary" },
      { key: "recupera_negociacoes", label: "A loja recupera negociações não fechadas?", type: "binary" },
    ],
  },
  {
    name: "Gestão da Gerente",
    observationKey: "observacoes_gestao_gerente",
    questions: [
      { key: "reuniao_diaria_registrada", label: "A reunião diária é realizada e registrada?", type: "binary" },
      { key: "feedback_individual_mes", label: "O feedback individual foi realizado no mês?", type: "binary" },
      { key: "plano_acao_documentado", label: "O plano de ação está documentado?", type: "binary" },
      { key: "escala_organizada", label: "A escala está organizada estrategicamente?", type: "binary" },
      { key: "lideranca_inspira", label: "A liderança inspira respeito e resultado?", type: "binary" },
      { key: "gerente_acompanha_vendas", label: "A gerente acompanha as vendas no salão?", type: "binary" },
      { key: "amostragem_livro_fiscal", label: "A amostragem de lançamento do livro fiscal está correta?", type: "binary" },
    ],
  },
  {
    name: "Estrutura da Loja",
    observationKey: "observacoes_estrutura_loja",
    questions: [
      { key: "lampadas_queimadas", label: "Existem lâmpadas queimadas?", type: "binary_inverse" },
      { key: "moveis_equipamentos_danificados", label: "Existem móveis ou equipamentos quebrados/danificados?", type: "binary_inverse" },
      { key: "pintura_acabamentos_conservados", label: "A pintura e os acabamentos estão conservados?", type: "binary" },
      { key: "ar_condicionado_funcionando", label: "O ar-condicionado está funcionando?", type: "binary" },
      { key: "som_ambiente_adequado", label: "O som ambiente está adequado?", type: "binary" },
      { key: "fachada_limpa_cuidada", label: "A fachada está limpa e bem cuidada?", type: "binary" },
      { key: "comunicacao_visual_sem_danos", label: "A comunicação visual está sem danos?", type: "binary" },
      { key: "loucas_personalizadas_perfeitas", label: "As louças personalizadas estão em perfeito estado?", type: "binary" },
      { key: "mascaras_provadores", label: "Há máscaras em todos os provadores?", type: "binary" },
    ],
  },
];

export const STRATEGIC_FIELDS = [
  { key: "maior_risco", label: "Maior risco da loja hoje" },
  { key: "maior_oportunidade", label: "Maior oportunidade de crescimento imediato" },
  { key: "virar_ouro", label: "O que precisa acontecer para virar Ouro" },
];

export const DNA_OPTIONS = ["Totalmente", "Parcialmente", "Não"] as const;

/**
 * Estrutura efetivamente usada por compute_bonus() em
 * src/calculations.py (confirmado — é esta, não BONUS_RULES abaixo).
 * Decide o bônus POR AVALIAÇÃO individual.
 */
export const BONUS_CONFIG = {
  silverManagerValueOption: 2000.0,
  bronzeManagerValueOption: 2000.0,
  goldTeamFundPercent: 0.01,
  goldSalesTeamPercent: 0.75,
  goldSupportTeamPercent: 0.25,
  goldSalesEqualPercent: 0.4,
  goldSalesIndividualSalesPercent: 0.6,
  bronzeMinWeightedScore: 7.5,
  gold: {
    minWeightedScore: 8.5,
    minResults: 8.8,
    minManagement: 8.5,
    minBlock: 8.0,
    requiresNoGraveDisciplinaryIssue: true,
  },
  silver: {
    minWeightedScore: 8.0,
    minResults: 8.3,
    minManagement: 8.0,
    minBlock: 7.5,
    managerValue: 2000.0,
  },
};

/**
 * NOTA — atualizado após ver src/dashboard.py também: BONUS_RULES não é
 * importado em config.py, calculations.py, forms.py NEM dashboard.py —
 * nenhum dos 4 arquivos principais do app usa esta estrutura. É bem
 * provável que seja código legado/não utilizado, mas mantenho aqui por
 * fidelidade ao original, para o caso de aparecer em algum script
 * separado de fechamento trimestral que ainda não vimos.
 */
export const BONUS_RULES = {
  quarterlyManagerValues: {
    Ouro: 5000.0,
    Prata: 3700.0,
    Bronze: 2000.0,
    "Sem bônus": 0.0,
  },
  consecutiveGoldExtra: {
    1: 0.0,
    2: 1000.0,
    3: 2000.0,
    4: 3000.0,
  },
  goldStrict: {
    minWeightedScore: 8.8,
    minResults: 9.0,
    minManagement: 8.5,
    minBlock: 8.0,
    requiresNoGraveDisciplinaryIssue: true,
  },
  goldStandard: {
    minWeightedScore: 8.5,
    minResults: 8.8,
    minManagement: 8.5,
    minBlock: 8.0,
    requiresNoGraveDisciplinaryIssue: true,
  },
  silver: {
    minWeightedScore: 8.0,
    minResults: 8.3,
    minManagement: 8.0,
    minBlock: 7.5,
  },
  bronze: {
    minWeightedScore: 7.5,
    minBlock: 7.0,
  },
  defaultGoldRule: "gold_strict" as const,
  minBlockScope: "all_sections" as const,
  teamFundPercent: 0.01,
  teamSalesPercent: 0.75,
  teamSupportPercent: 0.25,
};

// Confirmado em src/dashboard.py — usado para exibir observações por
// bloco no Histórico. Inclui 2 chaves legadas de avaliações antigas
// (antes da seção Experiência ser unificada) — só relevantes se você for
// migrar dados antigos do Supabase.
export const OBSERVATION_LABELS: Record<string, string> = {
  observacoes_equipe_atendimento: "Equipe e Atendimento",
  observacoes_vm: "Visual Merchandising",
  observacoes_estoque_produto: "Estoque e Produto",
  observacoes_resultados: "Resultados e Indicadores",
  observacoes_experiencia_cliente_premium: "Experiência da Cliente e Padrão Premium",
  observacoes_whatsapp: "WhatsApp e Vendas Digitais",
  observacoes_gestao_gerente: "Gestão da Gerente",
  observacoes_estrutura_loja: "Estrutura da Loja",
  // legado
  observacoes_experiencia_cliente: "Experiência da Cliente",
  observacoes_experiencia_premium: "Experiência Premium",
};

export const STRATEGIC_LABELS: Record<string, string> = {
  maior_risco: "Maior risco da loja hoje",
  maior_oportunidade: "Maior oportunidade de crescimento imediato",
  virar_ouro: "O que precisa acontecer para virar Ouro",
  dna_charth: "A loja representa o DNA da Charth?",
};

// Cores confirmadas em dashboard.py (STATUS_COLOR_MAP) — usadas nos
// gráficos e badges de status operacional geral da avaliação.
export const STATUS_COLOR_MAP: Record<string, string> = {
  "Excelência CHARTH": "#C9A0A0",
  "Loja Forte": "#C8A24A",
  "Loja em Atenção": "#A66A3F",
  "Plano de Ação Imediato": "#7F3438",
};

export const BONUS_COLOR_MAP: Record<string, string> = {
  Ouro: "#C8A24A",
  Prata: "#B8B8B8",
  Bronze: "#A66A3F",
  "Sem bônus": "#6D6E71",
};

export const ACTION_PLAN_STATUS_OPTIONS = [
  "Aberto",
  "Em andamento",
  "Reprogramado",
  "Concluído",
  "Cancelado",
] as const;

export const ACTION_PLAN_PRIORITY_OPTIONS = ["Alta", "Média", "Baixa", "Monitoramento"] as const;

export const ACTION_PLAN_STATUS_COLOR: Record<string, string> = {
  Aberto: "#7F3438",
  "Em andamento": "#A66A3F",
  Reprogramado: "#C8A24A",
  Concluído: "#6D6E71",
  Cancelado: "#9FA0A3",
};

export const ACTION_PLAN_PRIORITY_COLOR: Record<string, string> = {
  Alta: "#7F3438",
  Média: "#A66A3F",
  Baixa: "#B8B8B8",
  Monitoramento: "#6D6E71",
};
