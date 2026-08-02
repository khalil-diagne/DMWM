export type SeedEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  place: string;
  city: string;
  lat: number;
  lng: number;
  desc: string;
  host: string;
  phone: string;
};

export const seedCategories: { id: string; name: string; color: string }[] = [
  { id: "cat_ziarra", name: "Ziarra", color: "#0F3D2E" },
  { id: "cat_causerie", name: "Causerie", color: "#2E4053" },
  { id: "cat_rectial", name: "Récital", color: "#C1502E" },
  { id: "cat_social", name: "Social", color: "#D4A24C" },
  { id: "cat_assemblee", name: "Assemblée", color: "#1C2620" },
];

export const seedEvents: SeedEvent[] = [
  {
    id: "e1",
    title: "Ziarra hebdomadaire",
    category: "Ziarra",
    date: "2026-08-01",
    time: "20:00",
    place: "Chez Serigne Modou",
    city: "Cité Keur Gorgui, Dakar",
    lat: 14.7167,
    lng: -17.4677,
    desc: "Rencontre spirituelle hebdomadaire ouverte à tous les membres et sympathisants. Récitation du wird collectif suivie du dîner.",
    host: "Serigne Modou Fall",
    phone: "+221770000001",
  },
  {
    id: "e2",
    title: "Causerie religieuse",
    category: "Causerie",
    date: "2026-08-03",
    time: "16:00",
    place: "Domicile El Hadj Fallou",
    city: "Parcelles Assainies, Dakar",
    lat: 14.758,
    lng: -17.4331,
    desc: "Enseignement sur les fondements de la voie tidjane, suivi d'un moment de partage et de questions-réponses.",
    host: "El Hadj Fallou Diop",
    phone: "+221770000002",
  },
  {
    id: "e3",
    title: "Récital et invocations",
    category: "Récital",
    date: "2026-08-06",
    time: "21:00",
    place: "Mosquée du quartier",
    city: "Grand Yoff, Dakar",
    lat: 14.7392,
    lng: -17.4593,
    desc: "Soirée de récitals de Coran et d'invocations collectives, ouverte à toute la communauté du quartier.",
    host: "Comité culturel",
    phone: "+221770000003",
  },
  {
    id: "e4",
    title: "Journée de solidarité",
    category: "Social",
    date: "2026-08-10",
    time: "09:00",
    place: "Place publique de Médina",
    city: "Médina, Dakar",
    lat: 14.6805,
    lng: -17.4494,
    desc: "Distribution de vivres et consultation médicale gratuite organisées par la commission sociale du dahira.",
    host: "Commission sociale",
    phone: "+221770000004",
  },
  {
    id: "e5",
    title: "Assemblée générale annuelle",
    category: "Assemblée",
    date: "2026-08-17",
    time: "10:00",
    place: "Salle Ahmadou Bamba",
    city: "Point E, Dakar",
    lat: 14.6928,
    lng: -17.4614,
    desc: "Bilan moral et financier, élection du bureau et présentation du programme de l'année à venir.",
    host: "Bureau exécutif",
    phone: "+221770000005",
  },
];
