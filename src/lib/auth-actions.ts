// src/lib/auth-actions.ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { registerSchema } from "./schemas";

export async function registerUser(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, email, password, phone } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { error: "Ya existe una cuenta con ese email" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error en registro:", error);
    return { error: "Error al crear la cuenta" };
  }
}
