import { useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../store";
import { MultiMap } from "../components/Map";
import { fmtDate, mapsUrl, type EventItem } from "../data";

export default function MapPage() {
  const { events } = useEvents();
  const [sel, setSel] = useState<EventItem | null>(events[0] ?? null);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Géolocalisation</p>
      <h2 className="text-3xl font-extrabold text-green-darker">Carte des rencontres</h2>
      <p className="mt-1 text-sm text-ink/60">Cliquez sur un repère pour voir les détails du lieu.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-3xl border border-green-dark/10 shadow-lg">
          <MultiMap events={events} height={480} onSelect={setSel} />
        </div>
        <div className="space-y-3">
          {sel && (
            <div className="rounded-2xl bg-green-dark p-5 text-cream">
              <div className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Sélection</div>
              <h4 className="mt-1 text-lg font-bold">{sel.title}</h4>
              <p className="mt-1 text-sm text-cream/75">{fmtDate(sel.date)} — {sel.time}</p>
              <p className="text-sm text-cream/75">📍 {sel.place}, {sel.city}</p>
              <div className="mt-3 flex gap-2">
                <a href={mapsUrl(sel)} target="_blank" className="rounded-lg bg-gold px-3 py-2 text-xs font-bold text-green-darker">Itinéraire</a>
                <Link to={`/evenement/${sel.id}`} className="rounded-lg bg-terracotta px-3 py-2 text-xs font-bold text-white">Détails</Link>
              </div>
            </div>
          )}
          <div className="max-h-[300px] space-y-2 overflow-auto pr-1">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setSel(e)}
                className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                  sel?.id === e.id ? "border-gold bg-white" : "border-green-dark/10 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="font-semibold text-green-dark">{e.title}</div>
                <div className="text-xs text-ink/55">{e.city} · {e.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
