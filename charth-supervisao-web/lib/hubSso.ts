import { jwtVerify } from "jose";

/**
 * Login único pelo Hub CHARTH: o Hub emite um token JWT HS256 curto (60 s) quando a
 * pessoa clica no sistema, e envia por POST (campo `hub_token`) ao endereço do
 * sistema. Este arquivo valida o token com as MESMAS regras de `hub_sso_verify()`
 * do Hub (hub_sso.php):
 *   - só HS256, assinado com a chave compartilhada (HUB_SSO_SECRET);
 *   - iss = "charth-hub"; exp e iat obrigatórios; exp não pode ter passado;
 *     iat não pode estar mais de 30 s no futuro;
 *   - pid = id deste sistema no Hub (HUB_PORTAL_ID): token de outro sistema é recusado;
 *   - login obrigatório.
 * O servidor do app NÃO precisa alcançar o Hub: a conferência é local.
 */

export const COOKIE_TICKET = "charth_hub_ticket";
export const CAMINHO_TICKET = "/api/auth/hub";
export const DOMINIO_PADRAO = "charth.com.br";

const ISSUER = "charth-hub";

export class ErroSso extends Error {
  constructor(public codigo: "token_invalido") {
    super(codigo);
  }
}

export interface ConfigSso {
  segredo: string;
  portalId: number;
}

/** Devolve null se faltar algo (o acesso fica bloqueado). A chave tem de ter 32+ caracteres, como no Hub. */
export function lerConfigSso(): ConfigSso | null {
  const segredo = (process.env.HUB_SSO_SECRET ?? "").trim();
  const portalId = Number.parseInt((process.env.HUB_PORTAL_ID ?? "").trim(), 10);
  if (segredo.length < 32 || !Number.isInteger(portalId) || portalId <= 0) return null;
  return { segredo, portalId };
}

export interface IdentidadeHub {
  login: string; // no Hub é o campo "e-mail ou usuário" (pode não ser um e-mail)
  email: string; // só vem preenchido se for um e-mail válido
  nome: string;
  admin: boolean;
}

export async function verificarTokenSso(token: string, cfg: ConfigSso): Promise<IdentidadeHub> {
  if (token.length === 0 || token.length > 4096) throw new ErroSso("token_invalido");
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(cfg.segredo), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      requiredClaims: ["exp", "iat"],
    });

    const agora = Math.floor(Date.now() / 1000);
    if (Number(payload.iat) > agora + 30) throw new Error("iat no futuro");
    if (Number(payload.pid) !== cfg.portalId) throw new Error("token de outro sistema");

    const login = typeof payload.login === "string" ? payload.login.trim().toLowerCase() : "";
    if (!login) throw new Error("sem login");

    return {
      login,
      email: typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "",
      nome: typeof payload.name === "string" ? payload.name : "",
      admin: payload.role === "admin",
    };
  } catch {
    throw new ErroSso("token_invalido");
  }
}

/** E-mail da pessoa no Firebase Auth: o `email` do token; se não vier, `login@charth.com.br`. */
export function emailNoFirebase(i: IdentidadeHub): string {
  if (i.email.includes("@")) return i.email;
  return i.login.includes("@") ? i.login : `${i.login}@${DOMINIO_PADRAO}`;
}
