// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/schemas";
import { registerUser } from "@/lib/auth-actions";
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
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated"; // 👈 Importamos el auxiliar

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.phone) formData.append("phone", data.phone);

    const result = await registerUser(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else {
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setServerError("Error al iniciar sesión después del registro");
        setIsLoading(false);
      } else {
        // eslint-disable-next-line react-hooks/immutability, @next/next/no-location-assign-relative-destination
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    // 👇 Envolvemos todo el formulario con el protector
    <RedirectIfAuthenticated>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-600 p-3 rounded-full">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription>
              Unite a la comunidad para ayudar a mascotas perdidas
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  disabled={isLoading}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="11-1234-5678"
                  disabled={isLoading}
                  {...register("phone")}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrarme"}
              </Button>

              <p className="text-sm text-center text-gray-600">
                ¿Ya tenés cuenta?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Iniciá sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RedirectIfAuthenticated>
  );
}
