// src/utils/geo.js
import L from "leaflet";

const toRad = (d) => (d * Math.PI) / 180;

/** Área geodésica aproximada en m² de un polígono [[lat, lng], ...] */
export function polygonAreaM2(pts) {
  const n = pts.length;
  if (n < 3) return 0;
  const R = 6378137;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = pts[i];
    const [lat2, lng2] = pts[(i + 1) % n];
    sum += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((sum * R * R) / 2);
}

/** Formato de números en es-MX */
export const fmt = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

/** Puntos [lat, lng] → GeoJSON Polygon (orden [lng, lat], anillo cerrado) */
export function toGeoJSONPolygon(pts) {
  const ring = pts.map(([lat, lng]) => [Number(lng.toFixed(7)), Number(lat.toFixed(7))]);
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

/** GeoJSON Polygon [lng,lat] → Leaflet [[lat,lng], ...] */
export function geojsonToLeafletPositions(polygon) {
  if (!polygon?.coordinates?.[0]) return [];
  return polygon.coordinates[0].map(([lng, lat]) => [lat, lng]);
}

/** Ícono numerado para vértices (AddPercels + ViewPercel) */
export const vertexIcon = (index) =>
  L.divIcon({
    className: `vp-vertex ${index === 0 ? "vp-vertex--first" : ""}`,
    html: `<span>${index + 1}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

/** Tiles base (satélite y OSM) */
export const TILES = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  map: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
};