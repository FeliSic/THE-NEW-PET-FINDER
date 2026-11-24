"use client";

import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
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
  return (
    <div className="relative z-0 h-125 w-full overflow-hidden rounded-lg border border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false} // que la rueda siga scrolleando la página
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[lat, lng]}
          radius={radiusMeters}
          pathOptions={{
            color: "#4f46e5",
            fillColor: "#4f46e5",
            fillOpacity: 0.2,
          }}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold text-indigo-700">{petName}</p>
              <p className="text-xs text-gray-600">
                Zona aproximada del reporte
              </p>
            </div>
          </Popup>
        </Circle>
      </MapContainer>
    </div>
  );
}
