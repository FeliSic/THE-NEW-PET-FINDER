"use client";

import dynamic from "next/dynamic";

// Leaflet usa `window`, por eso se carga solo en el cliente
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-125 w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
      Cargando mapa...
    </div>
  ),
});

export default MapView;
