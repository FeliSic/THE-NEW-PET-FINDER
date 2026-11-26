// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated"; // 👈 Importamos

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setIsLoading(false);
    } else {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/dashboard";
    }
  }

  return (
    // 👇 Envolvemos el formulario
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-600 p-3 rounded-full">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Iniciá sesión para ayudar a encontrar mascotas
            </CardDescription>
          </CardHeader>

          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
              <p className="text-sm text-center text-gray-600">
                ¿No tenés cuenta?{" "}
                <Link
                  href="/register"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Registrate acá
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RedirectIfAuthenticated>
  );
}
