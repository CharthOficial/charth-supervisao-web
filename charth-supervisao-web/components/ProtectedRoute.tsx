"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { buscarPerfilUsuario } from "../lib/auth";
import type { Perfil, Usuario } from "../lib/types";

interface Props {
  children: (usuario: Usuario) => React.ReactNode;
  perfisPermitidos?: Perfil[]; // se omitido, qualquer perfil logado acessa
}

/** Envolve uma página e só renderiza o conteúdo se o usuário estiver
 *  logado e (se especificado) tiver um dos perfis permitidos. */
export default function ProtectedRoute({ children, perfisPermitidos }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUsuario(null);
        router.push("/");
        return;
      }
      const perfil = await buscarPerfilUsuario(firebaseUser.uid);
      setUsuario(perfil);

      if (perfil && perfisPermitidos && !perfisPermitidos.includes(perfil.perfil)) {
        router.push("/dashboard"); // sem permissão para esta rota
      }
    });
  }, [router, perfisPermitidos]);

  if (usuario === undefined) return <p>Carregando...</p>;
  if (usuario === null) return null; // redirecionando para login

  return <>{children(usuario)}</>;
}
