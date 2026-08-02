import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEvents } from "../store";
import { fmtDate, mapsUrl, waUrl } from "../data";
import EventCard from "../components/EventCard";
import { Ornament } from "../components/Layout";

function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const s = Math.floor(diff / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: "jours" },
    { v: Math.floor((s % 86400) / 3600), l: "heures" },
    { v: Math.floor((s % 3600) / 60), l: "min" },
    { v: s % 60, l: "sec" },
  ];
  return (
    <div className="mt-5 grid grid-cols-4 gap-2">
      {parts.map((p) => (
        <div key={p.l} className="rounded-xl bg-green-darker/90 py-2.5 text-center text-cream">
          <div className="text-xl font-extrabold text-gold">{String(p.v).padStart(2, "0")}</div>
          <div className="text-[0.6rem] uppercase tracking-widest opacity-70">{p.l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { events, loading } = useEvents();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const upcoming = events.find((e) => new Date(`${e.date}T${e.time}:00`).getTime() > now);
  const next = upcoming ?? events[0];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-creamdark to-cream px-5 pb-16 pt-14">
        <div className="islamic-pattern pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="arabic-calligraphy floaty text-4xl leading-loose text-green-dark md:text-5xl">
            وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ
          </div>
          <p className="mt-3 text-xs italic text-ink/50">
            « Entraidez-vous dans l'accomplissement des bonnes œuvres et de la piété » — Sourate Al-Mâ'ida, 5:2
          </p>
          <div className="mt-6 arabic-calligraphy text-2xl font-bold tracking-wide text-terracotta">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-green-darker md:text-5xl">
            Où se déroule notre <span className="text-terracotta">prochaine rencontre</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">
            Retrouvez chaque semaine le lieu exact des événements du dahira, avec la carte, l'itinéraire et le partage
            WhatsApp en un clic.
          </p>

          {next && (
            <div className="mx-auto mt-9 max-w-lg rounded-3xl border border-green-dark/10 bg-white p-6 text-left shadow-xl shadow-green-dark/10">
              <span className="inline-block rounded-full bg-gold px-3 py-1 text-[0.65rem] font-extrabold tracking-widest text-green-darker">
                PROCHAIN ÉVÉNEMENT
              </span>
              <h3 className="mt-3 text-xl font-bold text-green-dark">{next.title}</h3>
              <p className="mt-1 text-sm text-ink/70">📅 {fmtDate(next.date)} — {next.time}</p>
              <p className="text-sm text-ink/70">📍 {next.place}, {next.city}</p>
              <Countdown target={new Date(`${next.date}T${next.time}:00`)} />
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={mapsUrl(next)} target="_blank" className="rounded-lg bg-slate2 px-4 py-2 text-xs font-bold text-white">Itinéraire</a>
                <a href={waUrl(next)} target="_blank" className="rounded-lg bg-[#128C4A] px-4 py-2 text-xs font-bold text-white">Partager</a>
                <Link to={`/evenement/${next.id}`} className="rounded-lg bg-terracotta px-4 py-2 text-xs font-bold text-white">Détails</Link>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/evenements" className="rounded-xl bg-terracotta px-6 py-3 font-bold text-white shadow-lg shadow-terracotta/30">
              Voir tous les événements
            </Link>
            <Link to="/carte" className="rounded-xl border-2 border-green-dark px-6 py-3 font-bold text-green-dark">
              Carte interactive
            </Link>
          </div>
        </div>
      </section>

     
      <Ornament />

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h3 className="text-xl font-bold text-green-darker">À l'affiche cette semaine</h3>
        <p className="mb-6 text-sm text-ink/60">Les trois prochains rendez-vous de la communauté.</p>
        {loading ? (
          <p className="text-sm text-ink/50">Chargement des événements…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>

    </>
  );
}
