// src/app/dashboard/page.tsx
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, LogOut, MapPin, PawPrint, Plus } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveReport } from "@/lib/report-actions";
import { cn } from "@/lib/utils";
import { SPECIES_LABEL } from "@/lib/report-labels";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import ResolveButton from "@/components/ResolveButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PAGE_SIZE = 12;

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

async function resolveReportForm(formData: FormData): Promise<void> {
  "use server";
  const reportId = formData.get("reportId");
  if (typeof reportId !== "string") return;
  await resolveReport(reportId);
}

type SearchParams = Promise<{ page?: string }>;

/* ───────────── Página: shell estático ───────────── */

export default function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-indigo-600" />
            <span className="hidden text-xl font-bold sm:inline">
              Pet Finder
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Suspense
              fallback={<span className="hidden h-5 w-28 sm:inline-block" />}
            >
              <UserGreeting />
            </Suspense>

            <Link
              href="/dashboard/new-report"
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Reporte</span>
            </Link>

            <form action={logout}>
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Reportes Activos en 9 de Julio
        </h1>

        <Suspense fallback={<ReportsSkeleton />}>
          <Reports searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

/* ───────────── Partes dinámicas (dentro de Suspense) ───────────── */

async function UserGreeting() {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email;
  return (
    <span className="hidden text-sm text-gray-600 sm:inline">Hola, {name}</span>
  );
}

async function Reports({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { page: pageParam } = await searchParams;

  const total = await prisma.report.count({ where: { status: "ACTIVE" } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const requested = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isNaN(requested)
    ? 1
    : Math.min(Math.max(requested, 1), totalPages);

  if (total === 0) {
    return (
      <Card className="border-dashed py-12 text-center">
        <CardContent>
          <PawPrint className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            No hay reportes activos aún
          </h3>
          <p className="mb-6 text-gray-500">
            Sé el primero en reportar una mascota perdida o encontrada.
          </p>
          <Link href="/dashboard/new-report" className={buttonVariants()}>
            Crear primer reporte
          </Link>
        </CardContent>
      </Card>
    );
  }

  const reports = await prisma.report.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    // Solo lo que se muestra: nunca realLat/realLng ni el email del autor
    select: {
      id: true,
      userId: true,
      type: true,
      species: true,
      petName: true,
      description: true,
      imageUrl: true,
      locationRef: true,
      contactInfo: true,
      reward: true,
      rewardAmount: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + reports.length - 1;

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">
        Mostrando {from}–{to} de {total} {total === 1 ? "reporte" : "reportes"}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg"
          >
            <div className="relative h-48 w-full bg-gray-100">
              <Image
                src={report.imageUrl}
                alt={`Mascota ${report.petName ?? "sin nombre"}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <Badge
                className={cn(
                  "absolute right-3 top-3",
                  report.type === "LOST"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600",
                )}
              >
                {report.type === "LOST" ? "PERDIDA" : "ENCONTRADA"}
              </Badge>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {report.petName ?? "Sin nombre"}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({SPECIES_LABEL[report.species] ?? "Otro"})
                </span>
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {dateFormatter.format(report.createdAt)}
              </CardDescription>
            </CardHeader>

            <CardContent className="grow space-y-3">
              <p className="line-clamp-3 text-sm text-gray-700">
                {report.description}
              </p>

              {report.locationRef && (
                <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2 text-sm text-blue-800">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Zona de referencia:</p>
                    <p className="text-xs text-blue-700">
                      {report.locationRef}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-sm">
                <span className="font-medium text-gray-700">Contacto:</span>{" "}
                <span className="break-all text-indigo-600">
                  {report.contactInfo}
                </span>
              </div>

              {report.reward && (
                <div className="rounded-md bg-green-50 p-2 text-center text-sm font-semibold text-green-700">
                  💰 Recompensa:{" "}
                  {report.rewardAmount != null &&
                  Number(report.rewardAmount) > 0
                    ? moneyFormatter.format(Number(report.rewardAmount))
                    : "Sí"}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 border-t bg-gray-50/50 pt-3">
              <p className="mb-1 w-full text-center text-xs text-gray-500">
                Reportado por: {report.user.name ?? "Usuario"}
              </p>

              <div className="flex w-full gap-2">
                <Link
                  href={`/dashboard/report/${report.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex-1",
                  )}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver en Mapa
                </Link>

                {report.userId === session.user.id ? (
                  <form action={resolveReportForm} className="flex-1">
                    <input type="hidden" name="reportId" value={report.id} />
                    <ResolveButton />
                  </form>
                ) : (
                  <ContactButton contactInfo={report.contactInfo} />
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}

/* ───────────── Auxiliares ───────────── */

// Arma un link de contacto a partir de texto libre. Devuelve null si no puede.
function contactHref(raw: string): string | null {
  const email = raw.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  if (email) return `mailto:${email[0].replace(/[.,;:)]+$/, "")}`;

  let digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 8 || digits.length > 15) return null;

  if (digits.startsWith("54")) {
    // +54 sin el 9 de móvil: WhatsApp lo necesita
    if (!digits.startsWith("549") && digits.length === 12) {
      digits = `549${digits.slice(2)}`;
    }
  } else {
    // Formato local "área + 15 + número" (12 dígitos): el 15 sobra
    if (digits.length === 12) {
      for (const areaLen of [2, 3, 4]) {
        if (digits.slice(areaLen, areaLen + 2) === "15") {
          digits = digits.slice(0, areaLen) + digits.slice(areaLen + 2);
          break;
        }
      }
    }
    digits = `549${digits}`; // Argentina, móvil
  }

  return `https://wa.me/${digits}`;
}

function ContactButton({ contactInfo }: { contactInfo: string }) {
  const href = contactHref(contactInfo);
  if (!href) return null; // el contacto sigue visible como texto en la tarjeta

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "flex-1 justify-center",
      )}
    >
      Contactar
    </a>
  );
}

function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => (p === 1 ? "/dashboard" : `/dashboard?page=${p}`);
  const base = buttonVariants({ variant: "outline", size: "sm" });
  const disabled = cn(base, "pointer-events-none opacity-50");

  return (
    <nav
      aria-label="Paginación"
      className="mt-8 flex items-center justify-center gap-4"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={base}>
          ← Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>
          ← Anterior
        </span>
      )}

      <span className="text-sm text-gray-600">
        Página {page} de {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={base}>
          Siguiente →
        </Link>
      ) : (
        <span aria-disabled="true" className={disabled}>
          Siguiente →
        </span>
      )}
    </nav>
  );
}

function ReportsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-xl bg-white/70" />
      ))}
    </div>
  );
}
