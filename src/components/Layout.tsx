import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import logo from "../assets/logo.png";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/evenements", label: "Événements" },
  { to: "/carte", label: "Carte" },
  { to: "/apropos", label: "Le Dahira" },
  { to: "/contact", label: "Contact" },
];

export function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70" />
      <svg viewBox="0 0 40 40" className="h-7 w-7">
        <path d="M20 2 L24.5 12 L35 12 L27 19.5 L30 30 L20 23 L10 30 L13 19.5 L5 12 L15.5 12 Z" fill="none" stroke="#D4A24C" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 60 24" className="h-6 w-14">
        <line x1="6" y1="4" x2="54" y2="20" stroke="#D4A24C" strokeWidth="3" strokeLinecap="round" />
        <line x1="54" y1="4" x2="6" y2="20" stroke="#C1502E" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 40 40" className="h-7 w-7">
        <path d="M20 2 L24.5 12 L35 12 L27 19.5 L30 30 L20 23 L10 30 L13 19.5 L5 12 L15.5 12 Z" fill="none" stroke="#C1502E" strokeWidth="1.5" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70" />
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="islamic-pattern sticky top-0 z-50 bg-green-dark text-white shadow-lg shadow-green-darker/20">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo Dahiratoul Moustarchidina" className="h-16 w-16 shrink-0 rounded-full ring-2 ring-gold/70 object-cover" />
            <div className="leading-tight">
              <h1 className="text-[0.95rem] font-semibold tracking-wide">Dahiratoul Moustarchidina</h1>
              <span className="block text-[0.65rem] font-bold tracking-[0.18em] text-gold">WAL MOUSTARCHIDATY</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-4 lg:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-3 text-sm transition ${
                    isActive ? "bg-gold text-green-darker font-semibold" : "text-cream/85 hover:bg-white/10"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/espace-prive-d8a9x"
                className={({ isActive }) =>
                  `rounded-full px-4 py-3 text-sm transition ${
                    isActive ? "bg-gold text-green-darker font-semibold" : "text-cream/85 hover:bg-white/10"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/espace-prive-d8a9x/presences"
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm ${isActive ? "bg-gold/20 text-gold font-semibold" : "text-cream/85"}`
                }
              >
                Présences
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/espace-prive-d8a9x/presences"
                className={({ isActive }) =>
                  `rounded-full px-4 py-3 text-sm transition ${
                    isActive ? "bg-gold text-green-darker font-semibold" : "text-cream/85 hover:bg-white/10"
                  }`
                }
              >
                Présences
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {!user && (
              <NavLink
                to="/connexion-admin"
                className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-green-darker transition hover:opacity-90"
              >
                Se connecter
              </NavLink>
            )}
            <span className="arabic hidden text-lg text-gold/90 lg:block">بسم الله الرحمن الرحيم</span>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg border border-white/25 p-2 lg:hidden"
              aria-label="Menu"
            >
              <div className="space-y-1">
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
              </div>
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-white/10 bg-green-darker px-5 pb-4 lg:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm ${isActive ? "bg-gold/20 text-gold font-semibold" : "text-cream/85"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/espace-prive-d8a9x"
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm ${isActive ? "bg-gold/20 text-gold font-semibold" : "text-cream/85"}`
                }
              >
                Admin
              </NavLink>
            )}
            {!user && (
              <NavLink
                to="/connexion-admin"
                className="block rounded-xl bg-gold px-4 py-3 text-center text-sm font-bold text-green-darker"
              >
                Se connecter
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="islamic-pattern bg-green-darker px-5 py-10 text-center text-sm text-[#cfd8d2]">
        <div className="flex flex-col items-center">
          <div className="arabic mb-4 text-2xl text-gold">الحمد لله رب العالمين</div>
          <img src={logo} alt="Logo Dahiratoul Moustarchidina Wal Moustarchidaty" className="mb-4 h-20 w-20 rounded-full ring-2 ring-gold/70 object-cover" />
          <strong className="text-gold">Dahiratoul Moustarchidina Wal Moustarchidaty</strong>
          <p className="mt-1">Dakar, Sénégal — Prototype de site communautaire</p>
        </div>
      </footer>
    </div>
  );
}
