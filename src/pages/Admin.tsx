import { useEffect, useState } from "react";
import { useEvents } from "../store";
import { useAuth } from "../auth";
import { api, type ApiUser } from "../api";
import EventCard from "../components/EventCard";
import type { EventItem } from "../data";

const empty = {
  title: "",
  category: "Ziarra",
  date: "",
  time: "20:00",
  place: "",
  city: "Dakar",
  lat: "14.7167",
  lng: "-17.4677",
  desc: "",
  host: "",
  phone: "+221770000000",
};

export default function Admin() {
  const { events, add, remove, reset, loading, error } = useEvents();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<"events" | "users">("events");
  const [f, setF] = useState({ ...empty });
  const [msg, setMsg] = useState("");

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMsg("");
    try {
      await add({
        ...f,
        category: f.category as EventItem["category"],
        lat: parseFloat(f.lat),
        lng: parseFloat(f.lng),
      });
      setF({ ...empty });
      setMsg("Événement ajouté. Jazakoumoullahou khayran !");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur lors de l'ajout");
    }
  };

  const field = (k: keyof typeof empty, label: string, type = "text") => (
    <label className="block">
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/45">{label}</span>
      <input
        required
        type={type}
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1 w-full rounded-xl border border-green-dark/15 px-3 py-2 text-sm outline-none focus:border-gold"
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Gestion</p>
          <h2 className="text-3xl font-extrabold text-green-darker">Tableau de bord</h2>
          <p className="mt-1 text-xs text-ink/55">
            Connecté en tant que <strong>{user?.name}</strong> ·{" "}
            {user?.role === "admin" ? "Administrateur" : "Secrétaire"}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={async () => { await reset(); setMsg("Données réinitialisées."); }} className="rounded-xl border border-green-dark/25 px-4 py-2 text-xs font-bold text-green-dark">
            Réinitialiser les données
          </button>
          <button onClick={logout} className="rounded-xl bg-terracotta px-4 py-2 text-xs font-bold text-white">
            Se déconnecter
          </button>
        </div>
      </div>

      {user?.role === "admin" && (
        <div className="mt-6 flex gap-2">
          <button onClick={() => setTab("events")} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === "events" ? "bg-green-dark text-gold" : "border border-green-dark/20 bg-white text-green-dark"}`}>
            Événements
          </button>
          <button onClick={() => setTab("users")} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === "users" ? "bg-green-dark text-gold" : "border border-green-dark/20 bg-white text-green-dark"}`}>
            Comptes
          </button>
        </div>
      )}

      {tab === "events" && (
        <>
          {msg && <p className="mt-4 rounded-xl bg-gold/15 px-4 py-2 text-sm text-green-dark">{msg}</p>}
          {error && <p className="mt-4 rounded-xl bg-terracotta/10 px-4 py-2 text-sm text-terracotta">{error}</p>}

          <form onSubmit={submit} className="mt-8 grid gap-4 rounded-3xl border border-green-dark/10 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
            {field("title", "Titre")}
            <label className="block">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/45">Catégorie</span>
              <select
                value={f.category}
                onChange={(e) => setF({ ...f, category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-green-dark/15 px-3 py-2 text-sm outline-none focus:border-gold"
              >
                {["Ziarra", "Causerie", "Récital", "Social", "Assemblée"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {field("date", "Date", "date")}
            {field("time", "Heure", "time")}
            {field("place", "Lieu")}
            {field("city", "Quartier / Ville")}
            {field("lat", "Latitude")}
            {field("lng", "Longitude")}
            {field("host", "Organisateur")}
            {field("phone", "Téléphone")}
            <label className="block sm:col-span-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/45">Description</span>
              <textarea
                value={f.desc}
                onChange={(e) => setF({ ...f, desc: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-xl border border-green-dark/15 px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </label>
            <button className="self-end rounded-xl bg-terracotta py-3 font-bold text-white">Ajouter l'événement</button>
          </form>

          <h3 className="mt-10 text-lg font-bold text-green-darker">
            Événements enregistrés ({events.length})
          </h3>
          {loading ? (
            <p className="mt-4 text-sm text-ink/50">Chargement…</p>
          ) : (
            <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} e={e} onDelete={() => remove(e.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "users" && <UsersPanel onLogout={logout} />}
    </div>
  );
}

function UsersPanel({ onLogout }: { onLogout: () => void }) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "secretaire" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    try {
      const d = await api<{ users: ApiUser[] }>("/users");
      setUsers(d.users);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur de chargement" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMsg(null);
    try {
      await api("/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", password: "", role: "secretaire" });
      setMsg({ ok: true, text: "Compte créé." });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur de création" });
    }
  };

  const removeUser = async (id: string) => {
    setMsg(null);
    try {
      await api(`/users/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur de suppression" });
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <form onSubmit={submit} className="rounded-3xl border border-green-dark/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-green-darker">Créer un compte secrétaire</h3>
        {msg && (
          <p className={`mt-3 rounded-xl px-4 py-2 text-sm ${msg.ok ? "bg-gold/15 text-green-dark" : "bg-terracotta/10 text-terracotta"}`}>
            {msg.text}
          </p>
        )}
        {(["name", "email", "password"] as const).map((k) => (
          <label key={k} className="mt-4 block">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/45">
              {k === "name" ? "Nom" : k === "email" ? "Email" : "Mot de passe"}
            </span>
            <input
              required
              type={k === "password" ? "password" : k === "email" ? "email" : "text"}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="mt-1 w-full rounded-xl border border-green-dark/15 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
        ))}
        <label className="mt-4 block">
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-ink/45">Rôle</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full rounded-xl border border-green-dark/15 px-3 py-2 text-sm outline-none focus:border-gold"
          >
            <option value="secretaire">Secrétaire (gère les événements)</option>
            <option value="admin">Administrateur (gère tout)</option>
          </select>
        </label>
        <button className="mt-5 w-full rounded-xl bg-green-dark py-3 font-bold text-gold">Créer le compte</button>
      </form>

      <div className="rounded-3xl border border-green-dark/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-green-darker">Comptes existants ({users.length})</h3>
        <div className="mt-4 space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-green-dark/10 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-green-dark">{u.name}</div>
                <div className="truncate text-xs text-ink/55">{u.email}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[0.65rem] font-bold ${u.role === "admin" ? "bg-gold text-green-darker" : "bg-slate2 text-cream"}`}>
                {u.role === "admin" ? "Admin" : "Secrétaire"}
              </span>
              <button onClick={() => removeUser(u.id)} className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs font-bold text-terracotta">
                Supprimer
              </button>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-ink/50">Aucun compte.</p>}
        </div>
        <p className="mt-4 text-[0.65rem] text-ink/40">Vous ne pouvez pas supprimer votre propre compte.</p>
      </div>
      <button onClick={onLogout} className="text-xs font-bold uppercase tracking-widest text-terracotta underline">
        Se déconnecter
      </button>
    </div>
  );
}
