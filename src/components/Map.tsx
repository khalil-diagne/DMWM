import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { EventItem } from "../data";

const icon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#C1502E;border:2px solid #D4A24C;box-shadow:0 4px 10px rgba(0,0,0,.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 26],
});

export function MiniMap({ lat, lng, height = 160 }: { lat: number; lng: number; height?: number }) {
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
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={icon} />
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
  const center: [number, number] = events.length
    ? [events.reduce((s, e) => s + e.lat, 0) / events.length, events.reduce((s, e) => s + e.lng, 0) / events.length]
    : [14.72, -17.46];
  return (
    <MapContainer center={center} zoom={12} style={{ height, width: "100%" }} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
      {events.map((e) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={icon}
          eventHandlers={{ click: () => onSelect?.(e) }}
        >
          <Popup>
            <strong>{e.title}</strong>
            <br />
            {e.place} — {e.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
