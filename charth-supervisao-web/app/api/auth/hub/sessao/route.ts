import { NextResponse, type NextRequest } from "next/server";
import { CAMINHO_TICKET, COOKIE_TICKET } from "../../../../../lib/hubSso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Entrega, uma única vez, o token de sessão do Firebase guardado por /hub/sso. */
export async function POST(req: NextRequest) {
  const ticket = req.cookies.get(COOKIE_TICKET)?.value;
  if (!ticket) {
    return NextResponse.json({ erro: "sem_ticket" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const resp = NextResponse.json({ customToken: ticket }, { headers: { "Cache-Control": "no-store" } });
  resp.cookies.set(COOKIE_TICKET, "", { path: CAMINHO_TICKET, maxAge: 0 }); // uso único
  return resp;
}
