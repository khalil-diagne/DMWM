import { Link, useParams } from "react-router-dom";
import { useEvents } from "../store";
import { MultiMap } from "../components/Map";
import { fmtDate, mapsUrl, waUrl } from "../data";

export default function EventDetail() {
  const { id } = useParams();
  const { events } = useEvents();
  const e = events.find((x) => x.id === id);

  if (!e)
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-lg">Événement introuvable.</p>
        <Link to="/evenements" className="mt-4 inline-block text-terracotta underline">Retour au programme</Link>
      </div>
    );

  return (
    <div>
      <div className="overflow-hidden border-b border-green-dark/10">
        <MultiMap events={[e]} height={340} />
      </div>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link to="/evenements" className="text-xs font-bold uppercase tracking-widest text-terracotta">← Programme</Link>
        <span className="ml-3 rounded-full bg-green-dark px-3 py-1 text-[0.65rem] font-bold text-gold">{e.category}</span>
        <h2 className="mt-3 text-3xl font-extrabold text-green-darker">{e.title}</h2>
        <p className="mt-2 text-ink/70">{e.desc}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Date", fmtDate(e.date)],
            ["Heure", `${e.time} (GMT)`],
            ["Lieu", `${e.place}, ${e.city}`],
            ["Organisateur", e.host],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-green-dark/10 bg-white p-4">
              <div className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/40">{k}</div>
              <div className="mt-1 font-semibold text-green-dark">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={mapsUrl(e)} target="_blank" className="rounded-xl bg-slate2 px-5 py-3 text-sm font-bold text-white">Itinéraire</a>
          <a href={waUrl(e)} target="_blank" className="rounded-xl bg-[#128C4A] px-5 py-3 text-sm font-bold text-white">Partager WhatsApp</a>
          <a href={`tel:${e.phone}`} className="rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white">Appeler l'organisateur</a>
        </div>

        <div className="arabic mt-10 rounded-2xl bg-green-dark p-6 text-center text-xl text-gold">
          اللهم بارك لنا في هذا اللقاء
        </div>
      </div>
    </div>
  );
}
