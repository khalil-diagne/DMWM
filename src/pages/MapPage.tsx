import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../store";
import { useCategories, catColorOf } from "../categories";
import { MultiMap } from "../components/Map";
import { fmtDate, mapsUrl, type EventItem } from "../data";

export default function MapPage() {
  const { events } = useEvents();
  const { categories } = useCategories();
  const cats = ["Tous", ...categories.map((c) => c.name)];
  const [cat, setCat] = useState("Tous");
  const [sel, setSel] = useState<EventItem | null>(null);

  const filtered = useMemo(
    () => (cat === "Tous" ? events : events.filter((e) => e.category === cat)),
    [events, cat]
  );

  const select = (e: EventItem) => setSel(e);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Géolocalisation</p>
      <h2 className="text-3xl font-extrabold text-green-darker">Carte des rencontres</h2>
      <p className="mt-1 text-sm text-ink/60">Cliquez sur un repère pour voir les détails du lieu, ou filtrez par type de rencontre.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setSel(null);
            }}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              cat === c ? "bg-green-dark text-gold" : "border border-green-dark/20 bg-white text-green-dark"
            }`}
          >
            {c} {c !== "Tous" && `(${events.filter((e) => e.category === c).length})`}
          </button>
        ))}
        <span className="ml-auto text-xs text-ink/45">
          {filtered.length} repère{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-3xl border border-green-dark/10 shadow-lg">
          <MultiMap events={filtered} height={520} onSelect={select} />
        </div>

        <div className="space-y-3">
          {sel ? (
            <div className="rounded-2xl bg-green-dark p-5 text-cream shadow-lg">
              <span className="inline-block rounded-full bg-green-dark px-3 py-1 text-[0.65rem] font-bold tracking-wide text-gold ring-1 ring-gold/60">
                {sel.category}
              </span>
              <h4 className="mt-2 text-lg font-bold">{sel.title}</h4>
              <p className="mt-1 text-sm text-cream/75">{fmtDate(sel.date)}</p>
              <p className="text-sm text-cream/75">🕐 {sel.time} (GMT)</p>
              <p className="mt-1 text-sm text-cream/75">📍 {sel.place}, {sel.city}</p>
              <p className="mt-2 text-xs leading-relaxed text-cream/60">{sel.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={mapsUrl(sel)} target="_blank" className="rounded-lg bg-gold px-3 py-2 text-xs font-bold text-green-darker">Itinéraire</a>
                <Link to={`/evenement/${sel.id}`} className="rounded-lg bg-terracotta px-3 py-2 text-xs font-bold text-white">Détails</Link>
                <a href={`tel:${sel.phone}`} className="rounded-lg bg-white/15 px-3 py-2 text-xs font-bold text-white">📞 Appeler</a>
              </div>
            </div>
          ) : (
            <div className="islamic-pattern rounded-2xl bg-green-dark/5 p-6 text-center">
              <div className="arabic text-xl text-gold">انقر على الخريطة</div>
              <p className="mt-2 text-xs text-ink/55">Sélectionnez un repère sur la carte pour afficher les détails ici.</p>
            </div>
          )}

          <div className="rounded-2xl border border-green-dark/10 bg-white p-4">
            <div className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/45">Légende</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs text-ink/70">
                  <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          <div className="max-h-[240px] space-y-2 overflow-auto pr-1">
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => select(e)}
                className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                  sel?.id === e.id ? "border-gold bg-white shadow-md" : "border-green-dark/10 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: catColorOf(categories, e.category) }} />
                  <div className="font-semibold text-green-dark">{e.title}</div>
                </div>
                <div className="mt-0.5 pl-[18px] text-xs text-ink/55">{e.city} · {e.time}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="pt-6 text-center text-sm text-ink/50">Aucun repère pour cette catégorie.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
