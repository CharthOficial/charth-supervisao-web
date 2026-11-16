import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "../../../lib/firebaseAdmin";
import { origemDaRequisicao } from "../../../lib/origem";
import {
  CAMINHO_TICKET,
  COOKIE_TICKET,
  emailNoFirebase,
  lerConfigSso,
  verificarTokenSso,
} from "../../../lib/hubSso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endereço que o Hub chama (POST, campo `hub_token`) quando a pessoa clica neste
 * sistema. É este endereço (…/hub/sso) que se cadastra como URL do sistema no Hub,
 * com "login único" marcado.
 *
 * Só entra quem (1) trouxe um token válido deste sistema, (2) tem usuário no
 * Firebase Auth e (3) tem documento em `usuarios/{uid}` (de lá vêm perfil e loja).
 * A sessão do Firebase é entregue por cookie de uso único (60 s), lido por
 * /api/auth/hub/sessao — o token nunca aparece na URL.
 */
export async function POST(req: NextRequest) {
  const { base, https } = origemDaRequisicao(req);
  const para = (caminho: string) => NextResponse.redirect(new URL(caminho, base), 303);

  const cfg = lerConfigSso();
  if (!cfg) return para("/entrar?erro=hub_nao_configurado");

  let token = "";
  try {
    const valor = (await req.formData()).get("hub_token");
    token = typeof valor === "string" ? valor : "";
  } catch {
    return para("/entrar?erro=token_invalido");
  }

  let identidade;
  try {
    identidade = await verificarTokenSso(token, cfg);
  } catch {
    return para("/entrar?erro=token_invalido");
  }

  try {
    const email = emailNoFirebase(identidade);
    const auth = adminAuth();

    let usuario;
    try {
      usuario = await auth.getUserByEmail(email);
    } catch (erro) {
      if ((erro as { code?: string })?.code === "auth/user-not-found") {
        console.warn(`[hub] sem cadastro no app: ${identidade.login}`);
        return para("/entrar?erro=sem_acesso");
      }
      throw erro;
    }
    if (usuario.disabled) return para("/entrar?erro=sem_acesso");

    const doc = await adminDb().collection("usuarios").doc(usuario.uid).get();
    if (!doc.exists) {
      console.warn(`[hub] usuário sem documento em usuarios: ${identidade.login}`);
      return para("/entrar?erro=sem_acesso");
    }

    const customToken = await auth.createCustomToken(usuario.uid);
    const resp = para("/entrar");
    resp.cookies.set(COOKIE_TICKET, customToken, {
      httpOnly: true,
      sameSite: "lax", // a chegada vem do Hub (outro site): Lax é enviado na navegação de topo (GET)
      secure: https,
      path: CAMINHO_TICKET,
      maxAge: 60,
    });
    console.log(`[hub] login ok: ${identidade.login}`);
    return resp;
  } catch (erro) {
    // Nunca registrar o token nos logs.
    console.error("[hub] falha ao criar a sessão:", erro instanceof Error ? erro.message : "erro");
    return para("/entrar?erro=falha_interna");
  }
}

/** Quem abre este endereço direto (GET) vai para /entrar, que leva ao Hub. */
export async function GET(req: NextRequest) {
  const { base } = origemDaRequisicao(req);
  return NextResponse.redirect(new URL("/entrar", base), 303);
}
