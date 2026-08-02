import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";

export type Category = { id: string; name: string; color: string };

const fallback: Category[] = [
  { id: "cat_ziarra", name: "Ziarra", color: "#0F3D2E" },
  { id: "cat_causerie", name: "Causerie", color: "#2E4053" },
  { id: "cat_rectial", name: "Récital", color: "#C1502E" },
  { id: "cat_social", name: "Social", color: "#D4A24C" },
  { id: "cat_assemblee", name: "Assemblée", color: "#1C2620" },
];

type Ctx = {
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (name: string, color: string) => Promise<Category>;
  update: (id: string, name: string, color: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const CategoriesCtx = createContext<Ctx>({
  categories: fallback,
  loading: true,
  refresh: async () => {},
  add: async () => ({ id: "", name: "", color: "" }),
  update: async () => {},
  remove: async () => {},
});

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(fallback);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await api<{ categories: Category[] }>("/categories");
      if (d.categories.length) setCategories(d.categories);
    } catch {
      // conserver le fallback si l'API est injoignable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (name: string, color: string) => {
    const d = await api<{ category: Category }>("/categories", { method: "POST", body: JSON.stringify({ name, color }) });
    setCategories((p) => [...p, d.category].sort((a, b) => a.name.localeCompare(b.name)));
    return d.category;
  }, []);

  const update = useCallback(async (id: string, name: string, color: string) => {
    await api(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name, color }) });
    setCategories((p) => p.map((c) => (c.id === id ? { ...c, name, color } : c)).sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const remove = useCallback(async (id: string) => {
    await api(`/categories/${id}`, { method: "DELETE" });
    setCategories((p) => p.filter((c) => c.id !== id));
  }, []);

  const value = useMemo<Ctx>(
    () => ({ categories, loading, refresh, add, update, remove }),
    [categories, loading, refresh, add, update, remove]
  );

  return <CategoriesCtx.Provider value={value}>{children}</CategoriesCtx.Provider>;
}

export const useCategories = () => useContext(CategoriesCtx);

export const catColorOf = (categories: Category[], name: string) =>
  categories.find((c) => c.name === name)?.color ?? "#C1502E";
