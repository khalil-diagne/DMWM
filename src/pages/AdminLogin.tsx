import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      navigate("/espace-prive-d8a9x", { replace: true });
      return;
    }
    setError(res.error ?? "Mot de passe incorrect");
  };

  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <div className="rounded-3xl border border-green-dark/10 bg-white p-8 text-center shadow-lg">
        <div className="arabic text-2xl text-gold">مرحبا</div>
        <h2 className="mt-2 text-xl font-bold text-green-darker">Connexion administrateur</h2>
        <p className="mt-1 text-xs text-ink/55">Accédez à l'espace privé avec votre compte membre du bureau.</p>
        <form onSubmit={handleSubmit} className="mt-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="mt-5 w-full rounded-xl border border-green-dark/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            className="mt-3 w-full rounded-xl border border-green-dark/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
          {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-green-dark py-3 font-bold text-gold disabled:opacity-60"
          >
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
