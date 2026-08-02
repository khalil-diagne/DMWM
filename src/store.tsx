import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";
import type { EventItem } from "./data";

type Ctx = {
  events: EventItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (e: Omit<EventItem, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => Promise<void>;
};

const EventsCtx = createContext<Ctx>({
  events: [],
  loading: true,
  error: null,
  refresh: async () => {},
  add: async () => {},
  remove: async () => {},
  reset: async () => {},
});

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ events: EventItem[] }>("/events");
      setEvents([...data.events].sort((a, b) => a.date.localeCompare(b.date)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les événements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (e: Omit<EventItem, "id">) => {
      await api<{ event: EventItem }>("/events", { method: "POST", body: JSON.stringify(e) });
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await api(`/events/${id}`, { method: "DELETE" });
      setEvents((p) => p.filter((x) => x.id !== id));
    },
    []
  );

  const reset = useCallback(async () => {
    await api<{ ok: boolean }>("/reset", { method: "POST" });
    await refresh();
  }, [refresh]);

  const value = useMemo<Ctx>(
    () => ({ events, loading, error, refresh, add, remove, reset }),
    [events, loading, error, refresh, add, remove, reset]
  );

  return <EventsCtx.Provider value={value}>{children}</EventsCtx.Provider>;
}

export const useEvents = () => useContext(EventsCtx);
