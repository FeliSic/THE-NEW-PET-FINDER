// src/components/MapView.tsx
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  lat: number;
  lng: number;
  petName: string;
  // Mismo valor que usa obfuscateCoordinates al crear el reporte
  radiusMeters?: number;
}

export default function MapView({
  lat,
  lng,
  petName,
  radiusMeters = 400,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const circle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: "#4f46e5",
      fillColor: "#4f46e5",
      fillOpacity: 0.2,
    }).addTo(map);

    // Nodos DOM con textContent: petName es texto del usuario y bindPopup
    // con un string lo interpretaría como HTML (XSS)
    const popup = document.createElement("div");
    popup.style.textAlign = "center";
    const name = document.createElement("strong");
    name.textContent = petName;
    const note = document.createElement("div");
    note.style.fontSize = "12px";
    note.textContent = "Zona aproximada del reporte";
    popup.append(name, note);
    circle.bindPopup(popup);

    return () => {
      map.remove();
    };
  }, [lat, lng, petName, radiusMeters]);

  return (
    <div
      ref={containerRef}
      className="relative z-0 h-125 w-full overflow-hidden rounded-lg border border-gray-200"
    />
  );
}
