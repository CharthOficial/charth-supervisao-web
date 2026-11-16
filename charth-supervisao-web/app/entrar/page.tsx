"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL?.replace(/\/+$/, "");
const HUB_HOME = HUB_URL ? `${HUB_URL}/hub.php` : undefined;

const MENSAGENS: Record<string, string> = {
  sem_acesso: "Você não tem acesso a este app. Peça a liberação no Hub ou à T.I.",
  token_invalido: "O link de acesso expirou ou é inválido. Abra o app de novo pelo Hub.",
  hub_nao_configurado: "O acesso pelo Hub ainda não foi configurado neste app. Fale com a T.I.",
  falha_interna: "Não foi possível concluir o acesso. Fale com a T.I.",
  sem_hub: "Acesse este app pelo Hub da Charth.",
};

export default function EntrarPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const iniciou = useRef(false); // evita rodar duas vezes (modo estrito do React em dev)

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    const codigoErro = new URLSearchParams(window.location.search).get("erro");
    if (codigoErro) {
      window.history.replaceState(null, "", window.location.pathname);
      setErro(codigoErro);
      return;
    }

    (async () => {
      try {
        // 1) Chegou do Hub com a sessão pronta? Entrega única do token de sessão.
        const resp = await fetch("/api/auth/hub/sessao", { method: "POST" });
        if (resp.ok) {
          const { customToken } = await resp.json();
          await signInWithCustomToken(auth, customToken);
          router.replace("/dashboard");
          return;
        }
      } catch (e) {
        setErro((e as { code?: string })?.code ?? "falha_interna");
        return;
      }

      // 2) Sem sessão pronta: se já está logado segue; senão manda para o Hub.
      let cancelar: (() => void) | undefined;
      cancelar = onAuthStateChanged(auth, (usuario) => {
        cancelar?.();
        if (usuario) router.replace("/dashboard");
        else if (HUB_HOME) window.location.href = HUB_HOME;
        else setErro("sem_hub");
      });
    })();
  }, [router]);

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="charth-card" style={{ width: 360, textAlign: "center" }}>
        <div className="brand-title">CHARTH</div>
        <div className="brand-subtitle">Supervisão de Varejo</div>

        {erro === null ? (
          <p>Entrando pelo Hub...</p>
        ) : (
          <>
            <p>{MENSAGENS[erro] ?? `Não foi possível entrar (${erro}).`}</p>
            {HUB_HOME && (
              <a href={HUB_HOME} className="nav-pill">
                Ir para o Hub
              </a>
            )}
          </>
        )}
      </div>
    </main>
  );
}
