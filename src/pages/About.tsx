import { Ornament } from "../components/Layout";

const valeurs = [
  { i: "📖", t: "Éducation spirituelle", d: "Transmission des enseignements et du wird à travers les causeries hebdomadaires." },
  { i: "🤝", t: "Solidarité", d: "Entraide entre membres : santé, scolarité, cérémonies familiales." },
  { i: "🕌", t: "Ziarra", d: "Organisation des visites pieuses et des déplacements collectifs." },
  { i: "🎓", t: "Jeunesse", d: "Encadrement des jeunes, soutien scolaire et activités culturelles." },
];

const timeline = [
  ["1980", "Fondation du mouvement des Moustarchidines à Dakar."],
  ["1998", "Création du dahira de quartier et des premières commissions."],
  ["2010", "Ouverture du programme de solidarité et de santé communautaire."],
  ["2026", "Numérisation : cartographie des événements et annonces WhatsApp."],
];

export default function About() {
  return (
    <div>
      <section className="islamic-pattern bg-green-dark px-5 py-16 text-center text-cream">
        <div className="arabic text-3xl text-gold">دائرة المسترشدين والمسترشدات</div>
        <h2 className="mt-4 text-3xl font-extrabold">Le Dahira</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-cream/75">
          Une communauté de foi, de discipline et de solidarité, engagée dans l'éducation spirituelle et le service
          social au sein des quartiers de Dakar.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {valeurs.map((v) => (
            <div key={v.t} className="rounded-2xl border border-green-dark/10 bg-white p-6 shadow-sm">
              <div className="text-3xl">{v.i}</div>
              <h3 className="mt-2 text-lg font-bold text-green-dark">{v.t}</h3>
              <p className="mt-1 text-sm text-ink/65">{v.d}</p>
            </div>
          ))}
        </div>

        <Ornament />

        <h3 className="text-xl font-bold text-green-darker">Notre parcours</h3>
        <div className="mt-6 space-y-0 border-l-2 border-gold/40 pl-6">
          {timeline.map(([y, t]) => (
            <div key={y} className="relative pb-8">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-terracotta ring-4 ring-cream" />
              <div className="text-sm font-extrabold text-terracotta">{y}</div>
              <p className="text-sm text-ink/70">{t}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-creamdark p-8 text-center">
          <div className="arabic text-2xl text-green-dark">إنما المؤمنون إخوة</div>
          <p className="mt-2 text-xs italic text-ink/55">« Les croyants ne sont que des frères » — Sourate Al-Hujurat, 49:10</p>
        </div>
      </div>
    </div>
  );
}
