import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useCategories, catColorOf } from "../categories";
import type { EventItem } from "../data";

export type Layer = "sat" | "osm";

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export function Tile({ layer }: { layer: Layer }) {
  return layer === "sat" ? (
    <TileLayer key="sat" url={SAT_URL} attribution="© Esri, Maxar, Earthstar Geographics" />
  ) : (
    <TileLayer key="osm" url={OSM_URL} attribution="© OpenStreetMap" />
  );
}

export function LayerButton({ layer, setLayer }: { layer: Layer; setLayer: (l: Layer) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setLayer(layer === "sat" ? "osm" : "sat");
      }}
      className="absolute right-3 top-3 z-[500] rounded-lg bg-green-dark/90 px-3 py-1.5 text-[0.65rem] font-bold text-gold shadow-lg transition hover:bg-green-darker"
    >
      {layer === "sat" ? "🛰️ Satellite" : "🗺️ Plan"}
    </button>
  );
}

function useEventIcon() {
  const { categories } = useCategories();
  return (category: string) => {
    const color = catColorOf(categories, category);
    return L.divIcon({
      className: "",
      html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #D4A24C;box-shadow:0 4px 10px rgba(0,0,0,.3)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 26],
    });
  };
}

export { useEventIcon };

export function MiniMap({ lat, lng, category = "Ziarra", height = 160 }: { lat: number; lng: number; category?: string; height?: number }) {
  const [layer, setLayer] = useState<Layer>("sat");
  const eventIcon = useEventIcon();
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      style={{ height, width: "100%" }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <Tile layer={layer} />
      <Marker position={[lat, lng]} icon={eventIcon(category)} />
      <LayerButton layer={layer} setLayer={setLayer} />
    </MapContainer>
  );
}

export function MultiMap({
  events,
  height = 460,
  onSelect,
}: {
  events: EventItem[];
  height?: number;
  onSelect?: (e: EventItem) => void;
}) {
  const [layer, setLayer] = useState<Layer>("sat");
  const eventIcon = useEventIcon();
  const center: [number, number] = events.length
    ? [events.reduce((s, e) => s + e.lat, 0) / events.length, events.reduce((s, e) => s + e.lng, 0) / events.length]
    : [14.72, -17.46];
  return (
    <MapContainer center={center} zoom={12} style={{ height, width: "100%" }} scrollWheelZoom>
      <Tile layer={layer} />
      {events.map((e) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={eventIcon(e.category)}
          eventHandlers={{ click: () => onSelect?.(e) }}
        >
          <Popup>
            <strong>{e.title}</strong>
            <br />
            {e.place} — {e.city}
          </Popup>
        </Marker>
      ))}
      <LayerButton layer={layer} setLayer={setLayer} />
    </MapContainer>
  );
}
