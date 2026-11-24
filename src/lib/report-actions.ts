// src/lib/report-actions.ts
"use server";

import sharp from "sharp";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/schemas";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { obfuscateCoordinates } from "@/lib/geoUtils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_REPORTS_PER_HOUR = 5;

// Valida que sea una imagen real, la achica y elimina el EXIF (GPS incluido)
async function sanitizeImage(file: File): Promise<File | null> {
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    return new File([new Uint8Array(output)], "report.webp", {
      type: "image/webp",
    });
  } catch {
    return null;
  }
}

export async function createReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para crear un reporte" };
  }
  const userId = session.user.id;

  const rawData = {
    type: formData.get("type"),
    species: formData.get("species"),
    petName: formData.get("petName") || "",
    description: formData.get("description"),
    lat: parseFloat(formData.get("lat") as string),
    lng: parseFloat(formData.get("lng") as string),
    contactInfo: formData.get("contactInfo"),
    locationRef: formData.get("locationRef") || "",
    reward: formData.get("reward") === "on",
    rewardAmount: (formData.get("rewardAmount") as string) || "0",
    image: formData.get("image"),
  };

  const parsed = reportSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  // Rate limit simple por usuario
  const recentCount = await prisma.report.count({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentCount >= MAX_REPORTS_PER_HOUR) {
    return {
      error: "Creaste muchos reportes en poco tiempo. Probá más tarde.",
    };
  }

  const cleanImage = await sanitizeImage(data.image);
  if (!cleanImage) {
    return { error: "El archivo no es una imagen válida" };
  }

  try {
    const imageUrl = await uploadImageToCloudinary(cleanImage);
    const publicCoords = obfuscateCoordinates(data.lat, data.lng, 400);

    await prisma.report.create({
      data: {
        type: data.type,
        species: data.species,
        petName: data.petName || null,
        description: data.description,
        contactInfo: data.contactInfo, // ← faltaba
        locationRef: data.locationRef || null,
        imageUrl,
        realLat: data.lat,
        realLng: data.lng,
        publicLat: publicCoords.lat,
        publicLng: publicCoords.lng,
        reward: data.reward,
        rewardAmount: data.reward ? Number(data.rewardAmount ?? 0) : null,
        userId,
      },
    });
  } catch (error) {
    console.error("Error al crear reporte:", error);
    return {
      error: "Ocurrió un error al guardar el reporte. Intentá de nuevo.",
    };
  }

  // Fuera del try/catch: redirect() lanza una excepción a propósito
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// src/lib/report-actions.ts (agregá esta función al final)

export async function resolveReport(reportId: string) {
  if (typeof reportId !== "string" || reportId.length === 0) {
    return { error: "Reporte inválido" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión" };
  }

  try {
    // 1. Verificamos que el reporte exista y pertenezca al usuario
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true, status: true },
    });

    if (!report) {
      return { error: "Reporte no encontrado" };
    }

    if (report.userId !== session.user.id) {
      return { error: "No tienes permiso para modificar este reporte" };
    }

    if (report.status === "RESOLVED") {
      return { error: "Este reporte ya está resuelto" };
    }

    // 2. Actualizamos el estado
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al resolver reporte:", error);
    return { error: "Ocurrió un error al actualizar el reporte" };
  }
}
