/*
 * Initialise l'index Elasticsearch du dashboard :
 *   - crée l'index (ES_INDEX, défaut « utilisateurs ») avec le bon mapping s'il n'existe pas ;
 *   - le remplit avec des étudiants de départ s'il est vide.
 *
 * Usage :  npm run es:init            (n'écrase rien)
 *          npm run es:init -- --reset (supprime puis recrée l'index)
 *
 * Lit la même configuration que le dashboard (.env : ES_URL, ES_API_KEY ou ES_USERNAME/ES_PASSWORD).
 */
try {
  process.loadEnvFile(".env");
} catch {
  /* pas de .env : variables d'environnement du shell */
}

const url = process.env.ES_URL?.trim().replace(/\/+$/, "");
const index = process.env.ES_INDEX?.trim() || "utilisateurs";
if (!url) {
  console.error("ES_URL manque : copiez .env.example en .env et remplissez-le.");
  process.exit(1);
}

const headers = { "Content-Type": "application/json" };
if (process.env.ES_API_KEY) headers.Authorization = `ApiKey ${process.env.ES_API_KEY.trim()}`;
else if (process.env.ES_USERNAME)
  headers.Authorization = `Basic ${btoa(`${process.env.ES_USERNAME}:${process.env.ES_PASSWORD ?? ""}`)}`;

async function es(method, path, body, ndjson = false) {
  const res = await fetch(`${url}/${path}`, {
    method,
    headers: ndjson ? { ...headers, "Content-Type": "application/x-ndjson" } : headers,
    ...(body === undefined ? {} : { body: ndjson ? body : JSON.stringify(body) }),
  });
  const txt = await res.text();
  return { status: res.status, json: txt ? JSON.parse(txt) : null };
}

// Mapping : pays en keyword (agrégations, filtre exact), nom en text + keyword, date en date
const mapping = {
  mappings: {
    properties: {
      nom: { type: "text", fields: { keyword: { type: "keyword", ignore_above: 256 } } },
      pays: { type: "keyword" },
      date_inscription: { type: "date" },
    },
  },
};

// Générateur pseudo-aléatoire déterministe : mêmes données à chaque initialisation
let graine = 42;
const alea = () => ((graine = (graine * 16807) % 2147483647) - 1) / 2147483646;
const choisir = (t) => t[Math.floor(alea() * t.length)];

const prenoms = [
  "Amina",
  "Youssef",
  "Wei",
  "Giulia",
  "Moussa",
  "Ana",
  "Yasmine",
  "Karim",
  "Fatou",
  "Lucas",
  "Sofia",
  "Kenji",
  "Mateo",
  "Lina",
  "Arjun",
  "Chloé",
  "Mei",
  "Diego",
  "Aya",
  "Ivan",
  "Nour",
  "Thiago",
  "Hana",
  "Omar",
  "Zara",
  "Kwame",
  "Elena",
  "Rami",
  "Ines",
  "Tariq",
  "Priya",
  "Malik",
  "Leila",
  "Bao",
  "Camila",
  "Samir",
  "Aïcha",
  "Ibrahima",
  "Linh",
  "Mariam",
];
// Pondération inspirée des principaux pays d'origine (Campus France, 2024-2025)
const pays = [
  ["Maroc", 10],
  ["Algérie", 8],
  ["Chine", 6],
  ["Italie", 5],
  ["Sénégal", 4],
  ["Tunisie", 4],
  ["Côte d'Ivoire", 3],
  ["Cameroun", 3],
  ["Liban", 2],
  ["Espagne", 2],
  ["Inde", 2],
  ["Vietnam", 2],
  ["Brésil", 1],
  ["Colombie", 1],
  ["Allemagne", 1],
  ["États-Unis", 1],
  ["Japon", 1],
  ["Mexique", 1],
  ["Belgique", 1],
  ["Canada", 1],
];
const urne = pays.flatMap(([p, poids]) => Array(poids).fill(p));

const maintenant = Date.now();
const docs = [{ nom: "Alice", pays: "France", date_inscription: "2023-10-23T09:15:00Z" }];
for (let i = 0; i < 120; i++) {
  // Inscriptions réparties sur les 12 derniers mois, plus nombreuses récemment
  const joursAvant = Math.floor(Math.pow(alea(), 1.6) * 360);
  const date = new Date(maintenant - joursAvant * 86_400_000 - Math.floor(alea() * 86_400_000));
  docs.push({
    nom: choisir(prenoms),
    pays: choisir(urne),
    date_inscription: date.toISOString().replace(/\.\d{3}Z$/, "Z"),
  });
}

const reset = process.argv.includes("--reset");
const existe = (await es("HEAD", index)).status === 200;

if (existe && reset) {
  await es("DELETE", index);
  console.log(`Index « ${index} » supprimé.`);
}
if (!existe || reset) {
  const r = await es("PUT", index, mapping);
  if (r.status >= 300) {
    console.error("Création de l'index impossible :", JSON.stringify(r.json));
    process.exit(1);
  }
  console.log(`Index « ${index} » créé avec son mapping.`);
}

const compte = (await es("GET", `${index}/_count`)).json?.count ?? 0;
if (compte > 0) {
  console.log(
    `L'index contient déjà ${compte} documents : rien n'est ajouté (utilisez --reset pour repartir de zéro).`,
  );
} else {
  const corps = docs
    .map((d) => `${JSON.stringify({ index: { _index: index } })}\n${JSON.stringify(d)}\n`)
    .join("");
  const r = await es("POST", "_bulk?refresh=wait_for", corps, true);
  if (r.json?.errors) {
    console.error(
      "Certains documents n'ont pas été insérés :",
      JSON.stringify(r.json.items.find((i) => i.index.error)),
    );
    process.exit(1);
  }
  console.log(`${docs.length} étudiants ajoutés dans « ${index} ».`);
}
