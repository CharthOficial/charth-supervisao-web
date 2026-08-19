import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Avaliacao, PlanoAcao, Usuario } from "./types";
import { filtroLojaParaConsulta } from "./auth";
import { gerarPlanosDeAcao } from "./actionPlanGeneration";

const COL_AVALIACOES = "avaliacoes";
const COL_LOJAS = "lojas";
const COL_PLANOS = "planosDeAcao";
const COL_BONIFICACOES = "bonificacoes";

/** Salva uma nova avaliação E gera os Planos de Ação decorrentes (uma
 *  pendência por pergunta com nota baixa) — replica o comportamento do
 *  app original, onde salvar a avaliação já popula action_plans_df(). */
export async function salvarAvaliacao(avaliacao: Omit<Avaliacao, "id">): Promise<string> {
  const comCriadoEm = { ...avaliacao, criadoEm: avaliacao.criadoEm ?? new Date().toISOString() };
  const ref = await addDoc(collection(db, COL_AVALIACOES), comCriadoEm);

  const planos = gerarPlanosDeAcao(ref.id, comCriadoEm);
  if (planos.length > 0) {
    const batch = writeBatch(db);
    for (const plano of planos) {
      const planoRef = doc(collection(db, COL_PLANOS));
      batch.set(planoRef, plano);
    }
    await batch.commit();
  }

  return ref.id;
}

/** Lista avaliações respeitando a permissão do usuário logado. */
export async function listarAvaliacoes(usuario: Usuario) {
  const lojaFiltro = filtroLojaParaConsulta(usuario);

  const base = collection(db, COL_AVALIACOES);
  const q = lojaFiltro
    ? query(base, where("lojaId", "==", lojaFiltro), orderBy("data", "desc"))
    : query(base, orderBy("data", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Avaliacao);
}

export async function excluirAvaliacao(avaliacaoId: string): Promise<void> {
  await deleteDoc(doc(db, COL_AVALIACOES, avaliacaoId));
  // Planos de ação vinculados também são removidos, igual ao app original
  // ("remove a avaliação selecionada e todos os planos de ação vinculados").
  const planosSnap = await getDocs(
    query(collection(db, COL_PLANOS), where("avaliacaoId", "==", avaliacaoId))
  );
  const batch = writeBatch(db);
  planosSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function listarLojas() {
  const snap = await getDocs(collection(db, COL_LOJAS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Lista todos os usuários (coleção `usuarios`) — equivalente a
 *  list_users_df() de src/db.py. Só deve ser chamada por quem tem
 *  perfil admin (a Firestore Rule de /usuarios já restringe leitura a
 *  usuários autenticados; reforce para admin-only se quiser mais
 *  restrição). */
export async function listarUsuarios(): Promise<(Usuario & { id: string })[]> {
  const snap = await getDocs(collection(db, "usuarios"));
  return snap.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }) as Usuario & { id: string });
}

/** Lista Planos de Ação respeitando a mesma regra de permissão por loja
 *  usada nas avaliações (filter_df_for_user / GESTORA_CAN_VIEW_ALL_STORES). */
export async function listarPlanosDeAcao(usuario: Usuario): Promise<PlanoAcao[]> {
  const lojaFiltro = filtroLojaParaConsulta(usuario);

  const base = collection(db, COL_PLANOS);
  const q = lojaFiltro ? query(base, where("lojaId", "==", lojaFiltro)) : base;

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PlanoAcao);
}

/** Atualiza status/responsável/prazo/observações de um plano — replica
 *  update_action_plan() do app original, incluindo o registro de
 *  histórico em followupLog. Gestora não deve chamar isto (só
 *  visualiza; a UI já bloqueia, mas vale reforçar nas Firestore Rules
 *  também). */
export async function atualizarPlanoDeAcao(
  planoId: string,
  updates: Pick<PlanoAcao, "status" | "responsavel" | "prazo" | "observacoes">,
  atualizadoPor: string,
  planoAtual?: Pick<PlanoAcao, "historicoAcompanhamento">
): Promise<void> {
  const agora = new Date().toISOString();
  const linha = `[${agora}] ${atualizadoPor}: status=${updates.status}; prazo=${updates.prazo}; responsável=${
    updates.responsavel || "Não definido"
  }`;
  const logAnterior = planoAtual?.historicoAcompanhamento ?? "";
  const novoLog = logAnterior ? `${logAnterior}\n${linha}` : linha;

  await updateDoc(doc(db, COL_PLANOS, planoId), {
    ...updates,
    atualizadoEm: agora,
    atualizadoPor,
    historicoAcompanhamento: novoLog,
  });
}

export async function listarBonificacoes(ano: number) {
  const q = query(collection(db, COL_BONIFICACOES), where("ano", "==", ano));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
