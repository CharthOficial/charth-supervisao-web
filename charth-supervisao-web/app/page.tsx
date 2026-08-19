"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";

// Domínio fixo usado para completar o "e-mail" que o Firebase Auth
// exige internamente — a pessoa só digita o usuário (ex: "admin"),
// igual ao app original. Se ela digitar o e-mail completo, também
// funciona (não duplica o domínio).
const DOMINIO_LOGIN = "charth.com.br";

function paraEmailDeLogin(usuarioDigitado: string): string {
  const valor = usuarioDigitado.trim();
  return valor.includes("@") ? valor : `${valor}@${DOMINIO_LOGIN}`;
}

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await signInWithEmailAndPassword(auth, paraEmailDeLogin(usuario), senha);
      router.push("/dashboard");
    } catch {
      setErro("Usuário ou senha inválidos.");
    }
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <form onSubmit={handleLogin} className="charth-card" style={{ width: 320 }}>
        <div className="brand-title">CHARTH</div>
        <div className="brand-subtitle">Supervisão de Varejo</div>

        <label>Usuário</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="ex: admin"
          required
          autoCapitalize="none"
          autoCorrect="off"
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />

        {erro && <p style={{ color: "crimson" }}>{erro}</p>}

        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
