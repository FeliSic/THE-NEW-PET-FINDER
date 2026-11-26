// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";
import SmartAuthButton from "@/components/SmartAuthButton"; // 👈 Importamos el botón

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-4 rounded-full shadow-lg">
            <PawPrint className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-gray-900">Pet Finder</h1>
        <p className="text-xl text-gray-600 mb-8">
          Ayudá a reunir mascotas con sus familias en 9 de Julio y la región
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* 👇 Botón Inteligente: Cambia entre "Iniciar sesión" y "Ir al Dashboard" */}
          <SmartAuthButton />

          {/* El botón de registro siempre está disponible */}
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Crear cuenta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
