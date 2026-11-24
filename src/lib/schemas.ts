// src/lib/schemas.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const reportSchema = z.object({
  type: z.enum(["LOST", "FOUND"], {
    message: "Debes seleccionar si la mascota está perdida o fue encontrada",
  }),
  species: z.enum(["DOG", "CAT", "BIRD", "OTHER"], {
    message: "Seleccioná una especie válida",
  }),
  petName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede superar los 1000 caracteres"),
  lat: z
    .number({ error: "La ubicación en el mapa es obligatoria" })
    .min(-90)
    .max(90),
  lng: z
    .number({ error: "La ubicación en el mapa es obligatoria" })
    .min(-180)
    .max(180),
  image: z
    .instanceof(File, { message: "Debes subir una foto de la mascota" })
    .refine(
      (f) => f.size > 0 && f.size <= MAX_IMAGE_BYTES,
      "La imagen no puede superar los 5 MB",
    )
    .refine(
      (f) => ALLOWED_IMAGE_TYPES.includes(f.type),
      "Formato no permitido (JPG, PNG o WebP)",
    ),
  contactInfo: z
    .string()
    .trim()
    .min(5, "Información de contacto obligatoria (ej: WhatsApp)")
    .max(100, "El contacto es demasiado largo"),
  reward: z.boolean(), // sin .default(false)

  rewardAmount: z
    .string()
    .regex(/^\d{1,9}(\.\d{1,2})?$/, "Monto inválido")
    .optional()
    .or(z.literal("")),
  locationRef: z
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ReportInput = z.infer<typeof reportSchema>;
