/**
 * Importa evaluations.csv e action_plans.csv (exportados do Supabase)
 * para as coleções `avaliacoes` e `planosDeAcao` do Firestore.
 *
 * Uso:
 *   1. Coloque evaluations.csv e action_plans.csv nesta pasta
 *   2. Coloque serviceAccountKey.json nesta pasta (ver README.md)
 *   3. npm install
 *   4. node importar.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const admin = require("firebase-admin");
const { QUESTION_TO_SECTION, OBSERVATION_KEY_TO_SECTION } = require("./sectionMapping");

/** Aceita tanto "evaluations.csv" quanto o nome padrão de exportação
 *  do Supabase, "evaluations_rows.csv" — evita ter que renomear os
 *  arquivos manualmente antes de rodar. */
function encontrarArquivo(nomeBase) {
  const candidatos = [`${nomeBase}.csv`, `${nomeBase}_rows.csv`];
  for (const nome of candidatos) {
    const caminho = path.join(__dirname, nome);
    if (fs.existsSync(caminho)) return caminho;
  }
  return null;
}

const CAMINHO_CHAVE = path.join(__dirname, "serviceAccountKey.json");
const CAMINHO_EVALUATIONS = encontrarArquivo("evaluations");
const CAMINHO_ACTION_PLANS = encontrarArquivo("action_plans");

if (!fs.existsSync(CAMINHO_CHAVE)) {
  console.error(
    "\n❌ Não encontrei serviceAccountKey.json nesta pasta.\n" +
      "Veja o README.md — 'Gerar nova chave privada' no Firebase Console.\n"
  );
  process.exit(1);
}

if (!CAMINHO_EVALUATIONS) {
  console.error(
    "\n❌ Não encontrei evaluations.csv nem evaluations_rows.csv nesta pasta.\n"
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(CAMINHO_CHAVE)),
});
const db = admin.firestore();
// Muitos planos de ação antigos nunca foram atualizados, então
// atualizadoEm/atualizadoPor/historicoAcompanhamento ficam undefined —
// sem isto, o Firestore rejeita o documento inteiro.
db.settings({ ignoreUndefinedProperties: true });

/** Faz JSON.parse com segurança — colunas *_json do Supabase vêm como
 *  texto dentro da célula do CSV; se vier vazio, retorna {}. */
function parseJsonSeguro(valor) {
  if (!valor || valor.trim() === "") return {};
  try {
    return JSON.parse(valor);
  } catch {
    return {};
  }
}

/** Reconstrói a estrutura por seção (RespostaDeSecao) a partir do
 *  scores_json (flat) e observations_json (flat) do Supabase. */
function construirSecoes(scoresFlat, observationsFlat) {
  const secoes = {};

  for (const [questionKey, nota] of Object.entries(scoresFlat)) {
    const secaoNome = QUESTION_TO_SECTION[questionKey];
    if (!secaoNome) continue; // pergunta não reconhecida (ex: campo legado) — pulado
    if (!secoes[secaoNome]) secoes[secaoNome] = { respostas: {}, observacao: "" };
    secoes[secaoNome].respostas[questionKey] = Number(nota);
  }

  for (const [obsKey, texto] of Object.entries(observationsFlat)) {
    const secaoNome = OBSERVATION_KEY_TO_SECTION[obsKey];
    if (!secaoNome) continue; // chave legada (ex: observacoes_experiencia_premium antiga)
    if (!secoes[secaoNome]) secoes[secaoNome] = { respostas: {}, observacao: "" };
    secoes[secaoNome].observacao = texto || "";
  }

  return secoes;
}

async function importarEvaluations() {
  const csvTexto = fs.readFileSync(CAMINHO_EVALUATIONS, "utf-8");
  const linhas = parse(csvTexto, { columns: true, skip_empty_lines: true });

  console.log(`\nEncontradas ${linhas.length} avaliações no CSV. Importando...`);

  const mapaIdAntigoParaNovo = {}; // id numérico do Supabase -> id do documento no Firestore
  let importadas = 0;
  let comErro = 0;

  for (const linha of linhas) {
    try {
      // Idempotência: se essa avaliação já foi migrada numa rodada
      // anterior (ex: você rodou de novo depois de corrigir um erro),
      // não duplica — só reaproveita o id já existente no mapeamento.
      const jaExiste = await db
        .collection("avaliacoes")
        .where("_migradoDoSupabaseId", "==", linha.id)
        .limit(1)
        .get();

      if (!jaExiste.empty) {
        mapaIdAntigoParaNovo[linha.id] = jaExiste.docs[0].id;
        console.log(`  ⏭️  id=${linha.id} já importado antes — pulado.`);
        continue;
      }

      const scoresFlat = parseJsonSeguro(linha.scores_json);
      const observationsFlat = parseJsonSeguro(linha.observations_json);
      const strategic = parseJsonSeguro(linha.strategic_json);
      const bonus = parseJsonSeguro(linha.bonus_json);

      const secoes = construirSecoes(scoresFlat, observationsFlat);

      const avaliacao = {
        data: linha.evaluation_date,
        criadoEm: linha.created_at
          ? new Date(linha.created_at).toISOString()
          : new Date().toISOString(),
        supervisoraNome: linha.supervisor || "",
        // Legado: era um username do Supabase, não um UID do Firebase Auth.
        // Guardado só como referência histórica.
        supervisoraUid: linha.created_by ? `legado:${linha.created_by}` : "",
        gerente: linha.manager || "",
        lojaId: linha.store || "",
        lojaNome: linha.store || "",
        secoes,
        estrategicas: {
          maior_risco: strategic.maior_risco || "",
          maior_oportunidade: strategic.maior_oportunidade || "",
          virar_ouro: strategic.virar_ouro || "",
          dna_charth: strategic.dna_charth || "Totalmente",
          faltaGraveDisciplinar:
            linha.grave_disciplinary_issue === "1" || linha.grave_disciplinary_issue === "true",
        },
        notaFinalPonderada: Number(linha.weighted_score) || 0,
        status: linha.overall_status || "",
        bonus,
        // Rastreio da migração — não faz parte do tipo Avaliacao do app,
        // mas fica registrado no documento para auditoria futura.
        _migradoDoSupabaseId: linha.id,
      };

      const ref = await db.collection("avaliacoes").add(avaliacao);
      mapaIdAntigoParaNovo[linha.id] = ref.id;
      importadas++;
    } catch (erro) {
      comErro++;
      console.error(`  ⚠️  Erro na linha id=${linha.id}: ${erro.message}`);
    }
  }

  console.log(`✅ ${importadas} avaliações importadas. ${comErro} com erro.`);

  fs.writeFileSync(
    path.join(__dirname, "mapeamento-ids.json"),
    JSON.stringify(mapaIdAntigoParaNovo, null, 2)
  );
  console.log("Mapeamento de IDs salvo em mapeamento-ids.json (usado para os planos de ação).");

  return mapaIdAntigoParaNovo;
}

async function importarActionPlans(mapaIdAntigoParaNovo) {
  if (!CAMINHO_ACTION_PLANS || !fs.existsSync(CAMINHO_ACTION_PLANS)) {
    console.log("\naction_plans.csv (ou action_plans_rows.csv) não encontrado — pulando planos de ação.");
    return;
  }

  const csvTexto = fs.readFileSync(CAMINHO_ACTION_PLANS, "utf-8");
  const linhas = parse(csvTexto, { columns: true, skip_empty_lines: true });

  console.log(`\nEncontrados ${linhas.length} planos de ação no CSV. Importando...`);

  let importados = 0;
  let semAvaliacaoCorrespondente = 0;

  for (const linha of linhas) {
    const novoAvaliacaoId = mapaIdAntigoParaNovo[linha.evaluation_id];
    if (!novoAvaliacaoId) {
      semAvaliacaoCorrespondente++;
      continue;
    }

    const jaExiste = await db
      .collection("planosDeAcao")
      .where("_migradoDoSupabaseId", "==", linha.id)
      .limit(1)
      .get();
    if (!jaExiste.empty) {
      continue; // já importado numa rodada anterior
    }

    const plano = {
      avaliacaoId: novoAvaliacaoId,
      lojaId: linha.store || "",
      secao: linha.section || "",
      perguntaKey: linha.question_key || "",
      perguntaLabel: linha.question_label || "",
      nota: Number(linha.score) || 0,
      prioridade: linha.priority || "Monitoramento",
      responsavel: linha.responsible || "",
      prazo: linha.deadline || "",
      status: linha.status || "Aberto",
      observacoes: linha.notes || "",
      problema: linha.problem_text || "",
      impacto: linha.impact_text || "",
      acaoRecomendada: linha.recommended_action || "",
      criterioValidacao: linha.validation_criteria || "",
      criadoEm: linha.created_at ? new Date(linha.created_at).toISOString() : "",
      atualizadoEm: linha.updated_at ? new Date(linha.updated_at).toISOString() : undefined,
      atualizadoPor: linha.updated_by || undefined,
      historicoAcompanhamento: linha.followup_log || undefined,
      _migradoDoSupabaseId: linha.id,
    };

    await db.collection("planosDeAcao").add(plano);
    importados++;
  }

  console.log(`✅ ${importados} planos de ação importados.`);
  if (semAvaliacaoCorrespondente > 0) {
    console.log(
      `⚠️  ${semAvaliacaoCorrespondente} planos pulados por não encontrar a avaliação correspondente.`
    );
  }
}

async function main() {
  const mapaIds = await importarEvaluations();
  await importarActionPlans(mapaIds);
  console.log("\nMigração concluída.");
  process.exit(0);
}

main().catch((erro) => {
  console.error("Erro fatal na migração:", erro);
  process.exit(1);
});
