export type Perfil = "admin" | "supervisora" | "gestora";

export interface Usuario {
  uid: string; // vem do Firebase Auth
  nome: string;
  perfil: Perfil;
  lojaVinculada?: string;
  email?: string; // usado pelo botão de redefinição de senha em Configurações
}

export interface Loja {
  id: string;
  nome: string;
  regiao?: string;
}

/** Uma das 8 seções ponderáveis/não-ponderáveis (FORM_SECTIONS no
 *  config.py original) — respostas + observação em texto livre + foto
 *  opcional. */
export interface RespostaDeSecao {
  respostas: Record<string, number>; // perguntaKey -> nota (0 ou 10 se binária)
  observacao: string;
  fotoBase64?: string; // imagem comprimida (JPEG base64), se a seção tiver photoKey — ver lib/imageCompression.ts
}

export interface RespostasEstrategicas {
  maior_risco: string;
  maior_oportunidade: string;
  virar_ouro: string;
  dna_charth: "Totalmente" | "Parcialmente" | "Não";
  faltaGraveDisciplinar: boolean;
}

export interface Avaliacao {
  id: string;
  data: string; // ISO date — data da visita, escolhida pela supervisora no formulário
  criadoEm?: string; // ISO datetime — quando o documento foi salvo; usado só para desempate quando "data" é igual entre avaliações (equivalente ao desempate por "id" no app original)
  supervisoraNome: string;
  supervisoraUid: string;
  gerente: string; // um de MANAGERS
  lojaId: string;
  lojaNome: string; // um de STORES — duplicado aqui para listas sem join

  // chave = FormSectionConfig.name (ex: "Equipe e Atendimento")
  secoes: Record<string, RespostaDeSecao>;

  estrategicas: RespostasEstrategicas;

  notaFinalPonderada: number; // calculado com lib/calculations.ts
  status: string; // status_from_weighted no original — TODO: confirmar faixas exatas
  bonus?: Record<string, unknown>; // igual ao original: salvo vazio, calculado depois
}

/**
 * Um Plano de Ação = UMA pergunta com nota baixa em UMA avaliação —
 * confirmado em src/db.py (tabela action_plans, uma linha por pergunta).
 * Os 4 campos problema/impacto/açãoRecomendada/validação vêm de
 * actionPlanLibrary.ts (config.py original) e são salvos aqui — mas o
 * app original NÃO os exibe na tela (ver nota em actionSuggestions.ts).
 */
export interface PlanoAcao {
  id: string;
  avaliacaoId: string;
  lojaId: string; // "store"
  secao: string; // "section"
  perguntaKey: string; // "question_key"
  perguntaLabel: string; // "question_label"
  nota: number; // "score"
  prioridade: "Alta" | "Média" | "Baixa" | "Monitoramento";
  responsavel: string;
  prazo: string; // "deadline", ISO date
  status: "Aberto" | "Em andamento" | "Reprogramado" | "Concluído" | "Cancelado";
  observacoes: string; // "notes"
  // Salvos na criação (config.py / actionPlanLibrary.ts), não exibidos na
  // tela original — mantidos por fidelidade ao schema real.
  problema: string; // "problem_text"
  impacto: string; // "impact_text"
  acaoRecomendada: string; // "recommended_action"
  criterioValidacao: string; // "validation_criteria"
  criadoEm: string; // "created_at"
  atualizadoEm?: string; // "updated_at"
  atualizadoPor?: string; // "updated_by"
  historicoAcompanhamento?: string; // "followup_log"
}

export interface Bonificacao {
  id: string; // convenção: `${lojaId}_${ano}_T${trimestre}`
  lojaId: string;
  ano: number;
  trimestre: 1 | 2 | 3 | 4;
  mediaPonderada: number;
  faixa: "Ouro" | "Prata" | "Bronze" | "Sem bônus";
  valorCalculado: number;
}
