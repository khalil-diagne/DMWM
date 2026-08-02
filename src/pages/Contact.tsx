import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Restons en contact</p>
      <h2 className="text-3xl font-extrabold text-green-darker">Contact & inscription</h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-3xl border border-green-dark/10 bg-white p-6 shadow-sm"
        >
          {sent ? (
            <div className="py-10 text-center">
              <div className="text-4xl">✅</div>
              <p className="mt-3 font-bold text-green-dark">Jazakoumoullahou khayran !</p>
              <p className="text-sm text-ink/60">Votre demande a bien été enregistrée.</p>
            </div>
          ) : (
            <>
              {[
                ["Nom complet", "text", "Ex : Aïcha Ndiaye"],
                ["Téléphone / WhatsApp", "tel", "+221 77 000 00 00"],
                ["Quartier", "text", "Ex : Grand Yoff"],
              ].map(([l, t, p]) => (
                <label key={l} className="mb-4 block">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink/50">{l}</span>
                  <input required type={t} placeholder={p} className="mt-1 w-full rounded-xl border border-green-dark/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
                </label>
              ))}
              <label className="mb-4 block">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Message</span>
                <textarea rows={4} className="mt-1 w-full rounded-xl border border-green-dark/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
              <button className="w-full rounded-xl bg-terracotta py-3 font-bold text-white">Envoyer</button>
            </>
          )}
        </form>

        <div className="space-y-4">
          {[
            ["📞", "Téléphone", "+221 70 777 57 20"],
            ["💬", "Groupe WhatsApp", "Annonces des ziarras"],
            ["✉️", "Email", "diagneibeu10@gmail.com"],
            ["📍", "Siège", "Station Canada , Dakar, Sénégal"],
          ].map(([i, t, v]) => (
            <div key={t} className="flex items-start gap-4 rounded-2xl border border-green-dark/10 bg-white p-5">
              <div className="text-2xl">{i}</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink/45">{t}</div>
                <div className="font-semibold text-green-dark">{v}</div>
              </div>
            </div>
          ))}
          <div className="islamic-pattern rounded-2xl bg-green-dark p-6 text-center">
            <div className="arabic text-xl text-gold">جزاكم الله خيرا</div>
          </div>
        </div>
      </div>
    </div>
  );
}
