// Données de démonstration — utilisées tant qu'Elasticsearch n'est pas branché.
export type Etudiant = { nom: string; pays: string; date_inscription: string };

const noms = ["Amina","Lucas","Sofia","Kenji","Fatou","Mateo","Lina","Arjun","Chloé","Youssef","Mei","Diego","Aya","Ivan","Nour","Thiago","Hana","Omar","Zara","Kwame","Elena","Rami","Ines","Tariq","Priya","Malik","Leila","Bao","Camila","Samir"];
const pays = ["Maroc","Algérie","Chine","Italie","Sénégal","Tunisie","Côte d'Ivoire","Inde","Liban","Espagne","Brésil","Vietnam","Cameroun","Colombie","Japon","Allemagne","Mexique","États-Unis"];

export const etudiantsDemo: Etudiant[] = Array.from({ length: 48 }, (_, i) => ({
  nom: noms[(i * 7) % noms.length]!,
  pays: pays[(i * 5 + (i % 3)) % pays.length]!,
  date_inscription: new Date(Date.UTC(2026, 10, 9, 21, 0) - i * 1000 * 60 * 47).toISOString(),
}));

export function statsDemo() {
  const m = new Map<string, number>();
  etudiantsDemo.forEach((e) => m.set(e.pays, (m.get(e.pays) ?? 0) + 1));
  return [...m.entries()].map(([pays, total]) => ({ pays, total })).sort((a, b) => b.total - a.total);
}

// Coordonnées approximatives (lon, lat) des pays pour la carte
export const coordsPays: Record<string, [number, number]> = {
  "Maroc": [-7, 32], "Algérie": [3, 28], "Chine": [104, 35], "Italie": [12.5, 42.5], "Sénégal": [-14.5, 14.5],
  "Tunisie": [9.5, 34], "Côte d'Ivoire": [-5.5, 7.5], "Inde": [79, 22], "Liban": [35.8, 33.9], "Espagne": [-3.7, 40.4],
  "Brésil": [-51, -10], "Vietnam": [106, 16], "Cameroun": [12, 5.5], "Colombie": [-74, 4.5], "Japon": [138, 36],
  "Allemagne": [10, 51], "Mexique": [-102, 23], "États-Unis": [-98, 39], "France": [2.3, 46.6],
};
