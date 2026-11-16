import type { NextRequest } from "next/server";

/** Endereço público pelo qual a requisição chegou (atrás do Vercel ou de um
 *  proxy, o `req.url` pode mostrar o endereço interno). Também diz se é HTTPS,
 *  para o atributo `Secure` dos cookies. */
export function origemDaRequisicao(req: NextRequest): { base: string; https: boolean } {
  const primeiro = (v: string | null) => (v ?? "").split(",")[0].trim();
  const proto = primeiro(req.headers.get("x-forwarded-proto")) || req.nextUrl.protocol.replace(":", "");
  const host = primeiro(req.headers.get("x-forwarded-host")) || primeiro(req.headers.get("host")) || req.nextUrl.host;
  return { base: `${proto}://${host}`, https: proto === "https" };
}
