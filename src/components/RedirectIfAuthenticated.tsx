// src/components/RedirectIfAuthenticated.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // Si la sesión ya está activa, redirigimos al dashboard
    // Usamos replace para no ensuciar el historial del navegador
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Mientras verifica la sesión, mostramos un loader simple
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-xl font-semibold text-indigo-600 animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  // Si está autenticado, no renderizamos el formulario (el redirect ya debería haber saltado)
  if (status === "authenticated") {
    return null;
  }

  // Si no está autenticado, renderizamos el formulario (Login o Register)
  return <>{children}</>;
}
