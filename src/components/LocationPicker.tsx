// src/components/LocationPicker.tsx
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = { lat: number; lng: number };

interface LocationPickerProps {
  value: Location | null;
  onChange: (location: Location) => void;
}

// Centro inicial en 9 de Julio, Buenos Aires
const DEFAULT_CENTER: [number, number] = [-35.4454, -60.88];

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  const lat = value?.lat;
  const lng = value?.lng;

  // El click handler siempre llama a la última versión de onChange
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Crea el mapa al montar y lo destruye al desmontar (o al ocultarse la página)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const initial = initialValueRef.current;
    const map = L.map(el, { scrollWheelZoom: false }).setView(
      initial ? [initial.lat, initial.lng] : DEFAULT_CENTER,
      13,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sincroniza el marcador con el valor del form
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (lat == null || lng == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.circleMarker([lat, lng], {
        radius: 9,
        color: "#ffffff",
        weight: 3,
        fillColor: "#4f46e5",
        fillOpacity: 1,
      }).addTo(map);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        📍 Hacé clic en el mapa para ubicar a la mascota
      </p>
      <div
        ref={containerRef}
        className="relative z-0 h-80 overflow-hidden rounded-lg border"
      />
      {lat != null && lng != null && (
        <p className="text-xs text-gray-500">
          Ubicación seleccionada: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
