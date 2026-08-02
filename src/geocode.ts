export type GeoResult = { lat: number; lng: number; label: string };

export async function geocode(query: string): Promise<GeoResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  const first = data[0];
  if (!first) return null;
  return {
    lat: parseFloat(first.lat),
    lng: parseFloat(first.lon),
    label: first.display_name,
  };
}
