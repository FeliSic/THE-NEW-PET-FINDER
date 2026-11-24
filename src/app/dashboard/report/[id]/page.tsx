import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, PawPrint } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { SPECIES_LABEL } from "@/lib/report-labels";
import { Badge } from "@/components/ui/badge";
import MapView from "@/components/MapViewLoader";

type Params = Promise<{ id: string }>;

/* ───────────── Shell estático ───────────── */

export default function ReportMapPage({ params }: { params: Params }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>

        <Suspense
          fallback={
            <div className="h-150 animate-pulse rounded-xl bg-white/70" />
          }
        >
          <ReportDetail params={params} />
        </Suspense>
      </div>
    </div>
  );
}

/* ───────────── Parte dinámica ───────────── */

async function ReportDetail({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // Solo lo que se muestra: nunca realLat/realLng ni contactInfo
  const report = await prisma.report.findUnique({
    where: { id },
    select: {
      petName: true,
      species: true,
      type: true,
      description: true,
      locationRef: true,
      publicLat: true,
      publicLng: true,
      status: true,
    },
  });

  // Mismo criterio que el dashboard: solo se ven los reportes activos
  if (!report || report.status !== "ACTIVE") notFound();

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-xl">
      <div className="border-b bg-gray-50 p-6">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <PawPrint className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {report.petName ?? "Sin nombre"}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({SPECIES_LABEL[report.species] ?? "Otro"})
            </span>
          </h1>
          <Badge
            className={cn(
              report.type === "LOST"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600",
            )}
          >
            {report.type === "LOST" ? "PERDIDA" : "ENCONTRADA"}
          </Badge>
        </div>

        <p className="text-gray-600">{report.description}</p>

        {report.locationRef && (
          <div className="mt-3 flex w-fit items-center gap-2 rounded-md bg-blue-50 p-2 text-sm text-blue-700">
            <MapPin className="h-4 w-4" />
            {report.locationRef}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <MapPin className="h-5 w-5 text-red-500" />
            Ubicación aproximada
          </h2>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            🔒 Ubicación ofuscada por seguridad
          </span>
        </div>

        <MapView
          lat={report.publicLat}
          lng={report.publicLng}
          petName={report.petName ?? "Mascota"}
        />
      </div>
    </div>
  );
}
