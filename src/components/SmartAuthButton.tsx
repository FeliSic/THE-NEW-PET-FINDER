// src/components/SmartAuthButton.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

export default function SmartAuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mientras verifica la cookie, mostramos un estado de carga
  if (status === "loading") {
    return (
      <Button size="lg" variant="outline" disabled className="gap-2">
        <span className="animate-pulse">Cargando...</span>
      </Button>
    );
  }

  // Si hay sesión activa, lo mandamos directo al Dashboard
  if (session?.user) {
    return (
      <Button
        size="lg"
        variant="default"
        onClick={() => router.push("/dashboard")}
        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
      >
        <LayoutDashboard className="h-5 w-5" />
        Ir al Dashboard
      </Button>
    );
  }

  // Si no hay sesión, funciona como el botón de Login normal
  return (
    <Button
      size="lg"
      variant="outline"
      onClick={() => router.push("/login")}
      className="gap-2"
    >
      <LogIn className="h-5 w-5" />
      Iniciar sesión
    </Button>
  );
}
