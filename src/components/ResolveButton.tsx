// src/components/ResolveButton.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResolveButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      className="w-full bg-green-600 hover:bg-green-700"
      onClick={(e) => {
        const ok = window.confirm(
          "¿Marcar este reporte como resuelto? Dejará de mostrarse en el listado.",
        );
        if (!ok) e.preventDefault();
      }}
    >
      <Check className="mr-2 h-4 w-4" />
      {pending ? "Guardando..." : "Resuelto"}
    </Button>
  );
}
