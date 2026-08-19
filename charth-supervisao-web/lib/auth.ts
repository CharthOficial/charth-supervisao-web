import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { GESTORA_CAN_VIEW_ALL_STORES } from "./formConfig";
import type { Usuario, Perfil } from "./types";

// Valor real confirmado em src/config.py: GESTORA_CAN_VIEW_ALL_STORES = True.
export { GESTORA_CAN_VIEW_ALL_STORES };

/** Busca o documento de perfil do usuário logado (users/{uid}). */
export async function buscarPerfilUsuario(uid: string): Promise<Usuario | null> {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as Usuario;
}

/** Espelha as regras de permissão confirmadas em src/auth.py:
 *  - can_edit: admin e supervisora (Dashboard, Nova Avaliação, Histórico,
 *    Planos de Ação, Configurações)
 *  - can_admin: só admin (reset de senha de outros usuários)
 *  - gestora: só Dashboard, Histórico e Planos de Ação
 */
export function podeCriarAvaliacao(perfil: Perfil): boolean {
  return perfil === "admin" || perfil === "supervisora";
}

/** Equivalente a can_admin() de src/auth.py. */
export function podeAdmin(perfil: Perfil): boolean {
  return perfil === "admin";
}

export function podeVerTodasAsLojas(perfil: Perfil): boolean {
  if (perfil === "admin" || perfil === "supervisora") return true;
  if (perfil === "gestora") return GESTORA_CAN_VIEW_ALL_STORES;
  return false;
}

/** Retorna o filtro de loja a aplicar nas consultas, ou null se o perfil
 *  pode ver todas as lojas. */
export function filtroLojaParaConsulta(usuario: Usuario): string | null {
  if (podeVerTodasAsLojas(usuario.perfil)) return null;
  return usuario.lojaVinculada ?? null;
}
