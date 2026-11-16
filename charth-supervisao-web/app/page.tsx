"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";

/** Não há mais tela de login: o acesso é pelo Hub. Quem já tem sessão
 *  vai para o Dashboard; os demais vão para /entrar (que leva ao Hub). */
export default function Inicio() {
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, (usuario) => {
      router.replace(usuario ? "/dashboard" : "/entrar");
    });
  }, [router]);

  return <p style={{ padding: "2rem" }}>Carregando...</p>;
}
