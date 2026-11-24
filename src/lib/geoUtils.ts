// src/lib/geoUtils.ts
import "server-only";

function randomUnit(): number {
  const [n] = crypto.getRandomValues(new Uint32Array(1));
  return n / 2 ** 32; // [0, 1)
}

/** Desplaza el punto a una posición aleatoria dentro de un círculo de `radiusMeters`. */
export function obfuscateCoordinates(
  lat: number,
  lng: number,
  radiusMeters = 400,
) {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((lat * Math.PI) / 180);

  // sqrt para que los puntos se distribuyan parejo en el círculo
  const distance = radiusMeters * Math.sqrt(randomUnit());
  const angle = randomUnit() * 2 * Math.PI;

  return {
    lat: Number(
      (lat + (distance * Math.sin(angle)) / metersPerDegLat).toFixed(6),
    ),
    lng: Number(
      (lng + (distance * Math.cos(angle)) / metersPerDegLng).toFixed(6),
    ),
  };
}
