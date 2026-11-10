/*
 * Client Elasticsearch — exécuté UNIQUEMENT côté serveur.
 *
 * Configuration lue dans les variables d'environnement (fichier .env en local) :
 *   ES_URL       URL du cluster, ex. http://localhost:9200 ou https://xxx.es.io:443
 *   ES_API_KEY   clé d'API encodée (prioritaire), OU
 *   ES_USERNAME / ES_PASSWORD   authentification basique
 *   ES_INDEX     nom de l'index (défaut : utilisateurs)
 *
 * Le navigateur ne voit jamais ces valeurs : il appelle les fonctions serveur
 * de api.functions.ts, qui appellent ce module.
 */

let envCharge = false;

/* En dev, Vite ne place pas le .env dans process.env pour le code serveur :
 * on le charge nous-mêmes (Node ≥ 20.12). Les variables déjà définies gardent la priorité. */
function chargerEnv() {
  if (envCharge) return;
  envCharge = true;
  const p = process as typeof process & { loadEnvFile?: (path?: string) => void };
  if (typeof p.loadEnvFile !== "function") return;
  try {
    p.loadEnvFile(".env");
  } catch {
    // Pas de fichier .env : on garde les variables déjà définies.
  }
}

export class EsErreur extends Error {
  constructor(
    message: string,
    readonly status = 0,
  ) {
    super(message);
  }
}

type Config = { url: string; index: string; headers: Record<string, string> };

function config(): Config {
  chargerEnv();
  const url = process.env["ES_URL"]?.trim().replace(/\/+$/, "");
  if (!url) throw new EsErreur("ES_URL n'est pas défini dans le fichier .env.");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const apiKey = process.env["ES_API_KEY"]?.trim();
  const user = process.env["ES_USERNAME"]?.trim();
  if (apiKey) headers["Authorization"] = `ApiKey ${apiKey}`;
  else if (user)
    headers["Authorization"] = `Basic ${btoa(`${user}:${process.env["ES_PASSWORD"] ?? ""}`)}`;
  return { url, index: process.env["ES_INDEX"]?.trim() || "utilisateurs", headers };
}

/*
 * Appel REST vers l'index configuré. `chemin` est relatif à l'index,
 * ex. "_search", "_doc?refresh=true", "_update/abc".
 */
export async function es<T = unknown>(
  methode: "GET" | "POST" | "PUT" | "DELETE",
  chemin: string,
  body?: unknown,
): Promise<T> {
  const cfg = config();
  let res: Response;
  try {
    res = await fetch(`${cfg.url}/${encodeURIComponent(cfg.index)}/${chemin}`, {
      method: methode,
      headers: cfg.headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    // Le détail (URL du cluster) reste dans les logs serveur
    console.error("[elasticsearch]", cfg.url, (e as Error).message);
    throw new EsErreur(
      "Elasticsearch est injoignable. Vérifiez ES_URL dans .env et que le cluster est démarré.",
    );
  }
  if (!res.ok) {
    const detail = await res.text();
    console.error("[elasticsearch]", methode, chemin, res.status, detail.slice(0, 500));
    if (res.status === 401 || res.status === 403)
      throw new EsErreur(
        "Elasticsearch refuse l'accès : vérifiez ES_API_KEY ou ES_USERNAME / ES_PASSWORD.",
        res.status,
      );
    if (res.status === 404 && detail.includes("index_not_found"))
      throw new EsErreur(`L'index « ${cfg.index} » n'existe pas. Lancez « npm run es:init ».`, 404);
    throw new EsErreur(`Elasticsearch a répondu ${res.status}.`, res.status);
  }
  return (await res.json()) as T;
}
