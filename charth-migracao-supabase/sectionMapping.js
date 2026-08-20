// Gerado a partir de lib/formConfig.ts (FORM_SECTIONS) do app Next.js.
// Serve para reconstruir a estrutura aninhada por seção que o Firestore
// usa, a partir dos campos "achatados" do Supabase original
// (scores_json é um dict único com TODAS as perguntas juntas,
// independente da seção — precisamos saber a qual seção cada
// question_key pertence).

const FORM_SECTIONS = [
  {
    name: "Equipe e Atendimento",
    observationKey: "observacoes_equipe_atendimento",
    questions: [
      "postura_uniforme_apresentacao",
      "atendimento_consultivo",
      "oferecem_look_completo",
      "atendimento_personalizado",
      "senso_de_dono",
      "equipe_engajada_salao",
      "clima_organizacional",
    ],
  },
  {
    name: "Visual Merchandising",
    observationKey: "observacoes_vm",
    questions: [
      "pecas_semana_evidenciadas",
      "preco_visivel_sem_poluicao",
      "manequins_bem_montados",
      "vitrine_gera_desejo",
      "pecas_passadas_repostas",
      "araras_penteadas",
    ],
  },
  {
    name: "Estoque e Produto",
    observationKey: "observacoes_estoque_produto",
    questions: [
      "estoque_organizado_limpo",
      "reposicao_agil_salao",
      "ruptura_best_sellers",
      "pecas_defeito_separadas",
      "transferencias_solicitadas_em_dia",
      "acuracidade_estoque_5_itens",
    ],
  },
  {
    name: "Resultados e Indicadores",
    observationKey: "observacoes_resultados",
    questions: [
      "time_conhece_meta_diaria",
      "meta_semanal_acompanhada",
      "gerente_plano_acao_abaixo_meta",
      "ticket_medio_meta",
      "pa_meta",
      "conversao_monitorada",
    ],
  },
  {
    name: "Experiência da Cliente e Padrão Premium",
    observationKey: "observacoes_experiencia_cliente_premium",
    questions: [
      "loja_limpa",
      "provadores_impecaveis",
      "cliente_sugestao_look",
      "cliente_sugestao_variedade_cor",
      "embalagem_padrao_charth",
      "bala_charth_disponivel",
      "brigadeiro_charth_disponivel",
      "bebidas_personalizadas_disponiveis",
      "personalizados_armazenados",
      "itens_oferecidos_ativamente",
      "servico_elegancia",
      "experiencia_exclusividade",
      "insumos_adequados",
    ],
  },
  {
    name: "WhatsApp e Vendas Digitais",
    observationKey: "observacoes_whatsapp",
    questions: [
      "responde_ate_10_min",
      "responsavel_turno_whatsapp",
      "conversas_organizadas",
      "fotos_padrao_charth",
      "busca_ativa_whatsapp",
      "novidades_semanais",
      "pos_venda_whatsapp_24h",
      "recupera_negociacoes",
    ],
  },
  {
    name: "Gestão da Gerente",
    observationKey: "observacoes_gestao_gerente",
    questions: [
      "reuniao_diaria_registrada",
      "feedback_individual_mes",
      "plano_acao_documentado",
      "escala_organizada",
      "lideranca_inspira",
      "gerente_acompanha_vendas",
      "amostragem_livro_fiscal",
    ],
  },
  {
    name: "Estrutura da Loja",
    observationKey: "observacoes_estrutura_loja",
    questions: [
      "lampadas_queimadas",
      "moveis_equipamentos_danificados",
      "pintura_acabamentos_conservados",
      "ar_condicionado_funcionando",
      "som_ambiente_adequado",
      "fachada_limpa_cuidada",
      "comunicacao_visual_sem_danos",
      "loucas_personalizadas_perfeitas",
      "mascaras_provadores",
    ],
  },
];

const QUESTION_TO_SECTION = {};
const OBSERVATION_KEY_TO_SECTION = {};
for (const secao of FORM_SECTIONS) {
  OBSERVATION_KEY_TO_SECTION[secao.observationKey] = secao.name;
  for (const pergunta of secao.questions) {
    QUESTION_TO_SECTION[pergunta] = secao.name;
  }
}

module.exports = { FORM_SECTIONS, QUESTION_TO_SECTION, OBSERVATION_KEY_TO_SECTION };
