import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { fmtDate } from "../data";
import { useEvents } from "../store";

type AttendanceRow = {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
};

export default function Attendance() {
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const [eventId, setEventId] = useState("");
  const [attendees, setAttendees] = useState<AttendanceRow[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedEvent = events.find((event) => event.id === eventId);

  useEffect(() => {
    let active = true;
    if (!eventId) {
      setAttendees([]);
      setAttendeesLoading(false);
      setError("");
      return () => {
        active = false;
      };
    }

    setAttendees([]);
    setAttendeesLoading(true);
    setError("");
    api<{ attendees: AttendanceRow[] }>("/attendance?eventId=" + encodeURIComponent(eventId))
      .then((data) => {
        if (active) setAttendees(data.attendees);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Impossible de charger les présences");
      })
      .finally(() => {
        if (active) setAttendeesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventId]);

  const addAttendee = async (ev: FormEvent) => {
    ev.preventDefault();
    const cleanName = name.trim();
    if (!eventId || !cleanName) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api<{ attendee: AttendanceRow }>("/attendance", {
        method: "POST",
        body: JSON.stringify({ eventId, name: cleanName }),
      });
      setAttendees((current) => [...current, data.attendee]);
      setName("");
      setMessage("Présence enregistrée.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer la présence");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (id: string) => {
    const cleanName = editingName.trim();
    if (!cleanName) {
      setError("Le nom ne peut pas être vide.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api<{ attendee: AttendanceRow }>("/attendance/" + encodeURIComponent(id), {
        method: "PATCH",
        body: JSON.stringify({ name: cleanName }),
      });
      setAttendees((current) => current.map((item) => (item.id === id ? data.attendee : item)));
      setEditingId(null);
      setEditingName("");
      setMessage("Nom modifié.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de modifier le nom");
    } finally {
      setBusy(false);
    }
  };

  const deleteAttendee = async (id: string) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("/attendance/" + encodeURIComponent(id), { method: "DELETE" });
      setAttendees((current) => current.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
      setMessage("Présence supprimée.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de supprimer la présence");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <style>{"@page { margin: 18mm; } @media print { body * { visibility: hidden !important; } #attendance-print, #attendance-print * { visibility: visible !important; } #attendance-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0; border: 0; box-shadow: none; color: #111; background: #fff; } .no-print { display: none !important; } }"}</style>

      <div className="no-print">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-terracotta">Gestion</p>
        <h2 className="text-3xl font-extrabold text-green-darker">Présences aux événements</h2>
        <p className="mt-1 text-sm text-ink/60">Enregistrez les noms des personnes présentes à chaque rencontre.</p>

        <label className="mt-6 block max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Événement</span>
          <select
            value={eventId}
            onChange={(ev) => {
              setEventId(ev.target.value);
              setMessage("");
            }}
            disabled={eventsLoading || events.length === 0}
            className="mt-1 w-full rounded-xl border border-green-dark/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold"
          >
            <option value="">Choisir un événement…</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {fmtDate(event.date)} — {event.title}
              </option>
            ))}
          </select>
        </label>

        {eventsError && <p className="mt-3 text-sm text-terracotta">{eventsError}</p>}
        {!eventsLoading && !eventsError && events.length === 0 && (
          <p className="mt-4 rounded-xl bg-gold/15 px-4 py-3 text-sm text-green-dark">Aucun événement n’est disponible.</p>
        )}

        {selectedEvent && (
          <form onSubmit={addAttendee} className="mt-6 flex flex-col gap-3 rounded-2xl border border-green-dark/10 bg-white p-5 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Nom de la personne présente</span>
              <input
                required
                maxLength={120}
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Ex. Aïcha Ndiaye"
                className="mt-1 w-full rounded-xl border border-green-dark/15 px-4 py-3 text-sm outline-none focus:border-gold"
              />
            </label>
            <button
              disabled={busy || !name.trim()}
              className="rounded-xl bg-green-dark px-5 py-3 text-sm font-bold text-gold disabled:opacity-50"
            >
              {busy ? "Enregistrement…" : "Ajouter le nom"}
            </button>
          </form>
        )}

        {error && <p role="alert" className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-xl bg-gold/15 px-4 py-3 text-sm text-green-dark">{message}</p>}

        {selectedEvent && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="mr-auto text-sm text-ink/60">{attendees.length} présence{attendees.length === 1 ? "" : "s"} enregistrée{attendees.length === 1 ? "" : "s"}</p>
            <button
              type="button"
              disabled={attendeesLoading}
              onClick={() => window.print()}
              className="rounded-xl bg-terracotta px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Imprimer / Enregistrer en PDF
            </button>
          </div>
        )}
      </div>

      {selectedEvent && (
        <section id="attendance-print" className="mt-6 rounded-2xl border border-green-dark/10 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-green-darker">{selectedEvent.title}</h1>
          <p className="mt-1 text-sm text-ink/70">{fmtDate(selectedEvent.date)}</p>
          <div className="mt-5 border-t border-gray-300 pt-4">
            <h2 className="text-lg font-semibold">Liste des personnes présentes</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-6">
              {attendees.map((attendee) => (
                <li key={attendee.id} className="min-h-7">
                  {attendee.name}
                  <span className="no-print ml-3 inline-flex gap-2">
                    {editingId === attendee.id ? (
                      <>
                        <input
                          autoFocus
                          maxLength={120}
                          value={editingName}
                          onChange={(ev) => setEditingName(ev.target.value)}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter") {
                              ev.preventDefault();
                              void saveEdit(attendee.id);
                            }
                            if (ev.key === "Escape") setEditingId(null);
                          }}
                          className="rounded border border-green-dark/20 px-2 py-1 text-sm"
                        />
                        <button type="button" disabled={busy} onClick={() => void saveEdit(attendee.id)} className="text-xs font-bold text-green-dark">Enregistrer</button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-xs text-ink/60">Annuler</button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setEditingId(attendee.id);
                            setEditingName(attendee.name);
                            setError("");
                            setMessage("");
                          }}
                          className="text-xs font-bold text-green-dark underline"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void deleteAttendee(attendee.id)}
                          className="text-xs font-bold text-terracotta underline"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            {attendeesLoading && <p className="mt-4 text-sm text-ink/50">Chargement de la liste…</p>}
            {!attendeesLoading && attendees.length === 0 && (
              <p className="mt-4 text-sm text-ink/50">Aucune présence enregistrée.</p>
            )}
          </div>
          <p className="mt-6 border-t border-gray-300 pt-3 text-sm font-bold">Total : {attendees.length}</p>
        </section>
      )}
    </div>
  );
}
