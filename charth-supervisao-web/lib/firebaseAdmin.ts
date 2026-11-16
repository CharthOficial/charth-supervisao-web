import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — SÓ pode ser importado em código de servidor
 * (rotas em app/api/*). Usa a chave de conta de serviço guardada na
 * variável de ambiente FIREBASE_SERVICE_ACCOUNT (JSON inteiro, ou o
 * mesmo JSON em base64). Essa chave NUNCA vai para o repositório.
 *
 * A inicialização é preguiçosa (só quando alguém chama) para o build
 * não quebrar em ambientes sem a variável.
 */
function carregarCredencial() {
  const bruto = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!bruto) throw new Error("FIREBASE_SERVICE_ACCOUNT não configurada");

  const texto = bruto.trim().startsWith("{")
    ? bruto
    : Buffer.from(bruto, "base64").toString("utf-8");
  const conta = JSON.parse(texto);

  return cert({
    projectId: conta.project_id,
    clientEmail: conta.client_email,
    privateKey: String(conta.private_key).replace(/\\n/g, "\n"),
  });
}

let app: App | undefined;

function getAdminApp(): App {
  if (app) return app;
  app = getApps().length ? getApps()[0] : initializeApp({ credential: carregarCredencial() });
  return app;
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
