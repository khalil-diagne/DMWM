import { useMemo, useState } from "react";
import { useEvents } from "../store";
import { useCategories } from "../categories";
import EventCard from "../components/EventCard";

export default function Events() {
  const { events, loading, error } = useEvents();
  const { categories } = useCategories();
  const cats = ["Tous", ...categories.map((c) => c.name)];
  const [cat, setCat] = useState("Tous");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      events.filter(
        (e) =>
          (cat === "Tous" || e.category === cat) &&
          (q === "" ||
            (e.title + e.place + e.city + e.desc).toLowerCase().includes(q.toLowerCase()))
      ),
    [events, cat, q]
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Programme</p>
      <h2 className="text-3xl font-extrabold text-green-darker">Événements à venir</h2>
      <p className="mt-1 text-sm text-ink/60">
        Filtrez par type de rencontre, ouvrez l'itinéraire ou partagez sur WhatsApp.
      </p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                cat === c ? "bg-green-dark text-gold" : "border border-green-dark/20 bg-white text-green-dark"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un lieu, un quartier..."
          className="md:ml-auto w-full rounded-xl border border-green-dark/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold md:w-72"
        />
      </div>

      {loading ? (
        <p className="mt-16 text-center text-ink/50">Chargement des événements…</p>
      ) : error ? (
        <p className="mt-16 text-center text-terracotta">{error}</p>
      ) : list.length === 0 ? (
        <p className="mt-16 text-center text-ink/50">Aucun événement ne correspond à votre recherche.</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <EventCard key={e.id} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}
