// src/components/LocationPicker.tsx
"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number }) => void;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  // Centro inicial en 9 de Julio, Buenos Aires
  const defaultCenter: [number, number] = [-35.4454, -60.88];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        📍 Hacé clic en el mapa para ubicar a la mascota
      </label>
      <div className="border rounded-lg overflow-hidden h-80">
        <MapContainer
          center={value ? [value.lat, value.lng] : defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            onLocationSelect={(lat, lng) => onChange({ lat, lng })}
          />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
      {value && (
        <p className="text-xs text-gray-500">
          Ubicación seleccionada: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
