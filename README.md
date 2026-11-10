# Global Students — Dashboard Elasticsearch

Dashboard de démo connecté à Elasticsearch (index `utilisateurs`, documents
`{ nom, pays, date_inscription }`) :

- chiffres clés et graphiques calculés par agrégations (pays, 7 derniers jours, 12 derniers mois) ;
- tableau des étudiants avec recherche tolérante aux fautes, filtre par pays et pagination ;
- boutons **Ajouter**, **Modifier**, **Supprimer** qui écrivent directement dans Elasticsearch.

Le navigateur ne parle jamais à Elasticsearch : les requêtes passent par des fonctions
serveur TanStack Start (`src/lib/api.functions.ts`), et la clé reste dans `.env`.

## Brancher Elasticsearch

1. Copier `.env.example` en `.env` et renseigner `ES_URL` (l'URL **Elasticsearch** du projet,
   celle qui contient `.es.`, pas `.ingest.`) et `ES_API_KEY`.
2. La clé d'API doit avoir les droits sur l'index. Dans Kibana : *Management → API keys →
   Create API key*, activer *Control security privileges* et coller :

   ```json
   {
     "dashboard-etudiants": {
       "indices": [
         { "names": ["utilisateurs"], "privileges": ["read", "write", "create_index", "manage"] }
       ]
     }
   }
   ```

   Copier ensuite la valeur **Encoded** dans `ES_API_KEY`.
3. Créer l'index (mapping : `pays` keyword, `nom` text + keyword, `date_inscription` date)
   et le remplir avec des étudiants de départ :

   ```sh
   npm run es:init            # ne touche pas à un index déjà rempli
   npm run es:init -- --reset # repart de zéro
   ```

4. Lancer le dashboard : `npm run dev` puis <http://localhost:8080>.

Pour un Elasticsearch local à la place d'Elastic Cloud : `docker compose up -d`, puis
`ES_URL=http://localhost:9200` sans clé dans `.env`.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3929d01-38af-4e36-be07-fb2dafe1eab2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
