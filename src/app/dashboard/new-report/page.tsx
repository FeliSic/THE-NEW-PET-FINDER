"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, type ReportInput } from "@/lib/schemas";
import { createReport } from "@/lib/report-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { PawPrint, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

// Se carga solo en el cliente porque Leaflet usa `window`
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-md border border-input bg-muted flex items-center justify-center text-muted-foreground">
      Cargando mapa...
    </div>
  ),
});

export default function NewReportPage() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reward: false },
  });

  const rewardEnabled = useWatch({ control, name: "reward" });
  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });

  // Una sola fuente de verdad: el form (antes estaba duplicado en un useState)
  const selectedPosition = lat != null && lng != null ? { lat, lng } : null;

  const handleLocationChange = (loc: { lat: number; lng: number }) => {
    setValue("lat", loc.lat, { shouldValidate: true });
    setValue("lng", loc.lng, { shouldValidate: true });
  };

  const onSubmit = (data: ReportInput) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("species", data.species);
      formData.append("petName", data.petName || "");
      formData.append("description", data.description);
      formData.append("lat", data.lat.toString());
      formData.append("lng", data.lng.toString());
      formData.append("contactInfo", data.contactInfo);
      if (data.locationRef) formData.append("locationRef", data.locationRef);
      formData.append("reward", data.reward ? "on" : "off");
      if (data.reward && data.rewardAmount) {
        formData.append("rewardAmount", data.rewardAmount);
      }
      formData.append("image", data.image);

      try {
        const result = await createReport(formData);
        if (result?.error) setServerError(result.error);
        // Si salió bien, el redirect() de la action navega solo
      } catch {
        setServerError("No se pudo enviar el reporte. Probá de nuevo.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center border-b bg-white/50 rounded-t-xl">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-600 p-3 rounded-full">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Nuevo Reporte</CardTitle>
            <CardDescription>
              Completá los datos para ayudar a encontrar a esta mascota
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {serverError}
                </div>
              )}

              {/* Tipo y Especie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de reporte *</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending}
                    {...register("type")}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="LOST">🔴 Mascota Perdida</option>
                    <option value="FOUND">🟢 Mascota Encontrada</option>
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Especie *</Label>
                  <select
                    id="species"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending}
                    {...register("species")}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="DOG">🐶 Perro</option>
                    <option value="CAT">🐱 Gato</option>
                    <option value="BIRD">🐦 Ave</option>
                    <option value="OTHER">🐾 Otro</option>
                  </select>
                  {errors.species && (
                    <p className="text-sm text-red-600">
                      {errors.species.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Nombre y Descripción */}
              <div className="space-y-2">
                <Label htmlFor="petName">Nombre de la mascota (Opcional)</Label>
                <Input
                  id="petName"
                  placeholder="Ej: Firulais, Michi..."
                  disabled={isPending}
                  {...register("petName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción detallada *</Label>
                <textarea
                  id="description"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Color, tamaño, collar, señales particulares, último lugar visto..."
                  disabled={isPending}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Mapa */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  Ubicación aproximada *
                </Label>
                <LocationPicker
                  value={selectedPosition}
                  onChange={handleLocationChange}
                />
                {errors.lat && (
                  <p className="text-sm text-red-600">{errors.lat.message}</p>
                )}
              </div>

              {/* Campo de Referencia de Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="locationRef">
                  Referencia de la zona (Calle/Barrio)
                </Label>
                <Input
                  id="locationRef"
                  placeholder="Ej: Cerca de la Plaza 9 de Julio, sobre Av. Savio"
                  disabled={isPending}
                  {...register("locationRef")}
                />
                <p className="text-xs text-gray-500">
                  Ayuda a las personas a identificar la zona sin revelar la
                  dirección exacta.
                </p>
                {errors.locationRef && (
                  <p className="text-sm text-red-600">
                    {errors.locationRef.message}
                  </p>
                )}
              </div>

              {/* Imagen */}
              <div className="space-y-2">
                <Label htmlFor="image">Foto de la mascota *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  disabled={isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("image", file, { shouldValidate: true });
                  }}
                />
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image.message}</p>
                )}
              </div>

              {/* Contacto */}
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Información de contacto *</Label>
                <Input
                  id="contactInfo"
                  placeholder="Ej: WhatsApp 11-1234-5678 o email@ejemplo.com"
                  disabled={isPending}
                  {...register("contactInfo")}
                />
                {errors.contactInfo && (
                  <p className="text-sm text-red-600">
                    {errors.contactInfo.message}
                  </p>
                )}
              </div>

              {/* Recompensa */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="reward"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  disabled={isPending}
                  {...register("reward")}
                />
                <Label htmlFor="reward" className="cursor-pointer">
                  Ofrezco recompensa
                </Label>
              </div>

              {rewardEnabled && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="rewardAmount">
                    Monto de la recompensa (Opcional)
                  </Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 5000"
                    disabled={isPending}
                    {...register("rewardAmount")}
                  />
                  {errors.rewardAmount && (
                    <p className="text-sm text-red-600">
                      {errors.rewardAmount.message}
                    </p>
                  )}
                </div>
              )}

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Publicando reporte...
                  </span>
                ) : (
                  "Publicar Reporte"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
