import { Link } from "react-router-dom";
import { MiniMap } from "./Map";
import { mapsUrl, shortDate, waUrl, type EventItem } from "../data";

export default function EventCard({ e, onDelete }: { e: EventItem; onDelete?: () => void }) {
  const d = shortDate(e.date);
  return (
    <article className="fade-up group overflow-hidden rounded-2xl border border-green-dark/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-green-dark/10">
      <div className="relative">
        <MiniMap lat={e.lat} lng={e.lng} category={e.category} height={150} />
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl bg-white/95 px-3 py-2 text-center shadow-md">
          <div className="text-[0.6rem] font-bold tracking-widest text-terracotta">{d.weekday}</div>
          <div className="text-xl font-extrabold leading-none text-green-darker">{d.day}</div>
          <div className="text-[0.6rem] font-bold tracking-widest text-slate2">{d.month}</div>
        </div>
        <span className="absolute right-4 top-4 z-10 rounded-full bg-green-dark px-3 py-1 text-[0.65rem] font-bold tracking-wide text-gold">
          {e.category}
        </span>
      </div>
      <div className="p-5">
        <div className="mb-2 inline-block rounded-md bg-green-dark px-2.5 py-1 text-[0.68rem] font-extrabold tracking-wider text-gold">
          {e.time} · {e.city.split(",")[0]}
        </div>
        <h4 className="text-lg font-semibold text-ink">{e.title}</h4>
        <p className="mt-1 text-sm text-slate2/80">📍 {e.place}, {e.city}</p>
        <p className="mt-2 line-clamp-2 text-sm text-ink/60">{e.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/evenement/${e.id}`} className="rounded-lg bg-terracotta px-4 py-2 text-xs font-bold text-white hover:opacity-90">
            Détails
          </Link>
          <a href={waUrl(e)} target="_blank" className="rounded-lg bg-[#128C4A] px-4 py-2 text-xs font-bold text-white hover:opacity-90">
            WhatsApp
          </a>
          <a href={mapsUrl(e)} target="_blank" className="rounded-lg bg-slate2 px-4 py-2 text-xs font-bold text-white hover:opacity-90">
            Itinéraire
          </a>
          {onDelete && (
            <button onClick={onDelete} className="ml-auto rounded-lg border border-terracotta/40 px-3 py-2 text-xs font-bold text-terracotta">
              Supprimer
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
