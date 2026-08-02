import { useState } from "react";
import { MapContainer, Marker, useMapEvents } from "react-leaflet";
import { Tile, LayerButton, useEventIcon, type Layer } from "./Map";
import type { GeoResult } from "../geocode";

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function LocationPicker({
  value,
  onPick,
  height = 220,
}: {
  value: GeoResult | null;
  onPick: (lat: number, lng: number) => void;
  height?: number;
}) {
  const [layer, setLayer] = useState<Layer>("sat");
  const eventIcon = useEventIcon();
  const center: [number, number] = value ? [value.lat, value.lng] : [14.7167, -17.4677];
  return (
    <MapContainer
      center={center}
      zoom={value ? 15 : 12}
      style={{ height, width: "100%" }}
      scrollWheelZoom={false}
    >
      <Tile layer={layer} />
      <ClickCatcher onPick={onPick} />
      {value && <Marker position={[value.lat, value.lng]} icon={eventIcon("Ziarra")} />}
      <LayerButton layer={layer} setLayer={setLayer} />
    </MapContainer>
  );
}
