# INFORMADOR DE MANISES · CIUTAT EDUCADORA

Agent d'IA multilingüe que informa sobre l'**oferta formativa de Manises (València)**:
escoles infantils, col·legis públics i concertats, instituts (ESO, Batxillerat, FP),
Escola d'Art i Superior de Ceràmica, formació de persones adultes (CFPA Menicil),
tallers municipals, formació per a l'ocupació i ajudes al transport.

## Característiques

- 🌍 **14 llengües integrades en el mateix web**: valencià, castellà, anglès, francès,
  àrab (RTL), romanès, ucraïnès, rus, xinès, italià, portuguès, **tamazight (amazic)**,
  **bamanankan (la llengua de Mali)** i **wolof**.
- 🔊 **Veu**: dictat de preguntes (reconeixement de veu) i lectura en veu alta de les respostes.
- 🔠 **Lletra ampliable** (A− / A / A+), persistent entre visites.
- 📱 **PWA instal·lable** (icona: l'azulejo ceràmic) amb funcionament offline per a la web.
- 📝 **Registre automàtic de les preguntes** (Dia / Hora / Texto / idioma) a Supabase.

> ⚠️ Les cadenes d'interfície de tamazight, bamanankan i wolof s'han redactat de
> forma provisional: convé la revisió d'una persona parlant nativa abans de la
> difusió pública.

## Estructura del repositori (GitHub)

```
index.html                 ← pàgina principal (GitHub Pages)
styles.css
app.js                     ← front-end: idiomes, veu, lletra, xat
manifest.json              ← PWA
sw.js                      ← service worker (offline)
iconos/                    ← icones generades a partir de l'azulejo
oferta_formativa_manises.txt  ← BASE DE CONEIXEMENT (actualitzable amb commits)
worker.js                  ← Worker de Cloudflare (carpeta separada, no a Pages)
wrangler.toml              ← configuració del Worker
supabase/schema.sql        ← taula `preguntas`
```

## Desplegament (3 passos)

### 1. GitHub Pages
Puja `index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `iconos/`
i `oferta_formativa_manises.txt` al repo `manises-ciutat-educadora`.
Settings → Pages → Branch: `main` / root. La web queda a
`https://manises-ciutat-educadora.github.io/<repo>/`.

### 2. Supabase (preguntes)
1. Crea un projecte gratuït a https://supabase.com
2. SQL Editor → enganxa i executa `supabase/schema.sql`
3. Settings → API: copia l'URL i la **service_role key**

### 3. Worker de Cloudflare (com l'Ausiàs March)
```bash
npm i -g wrangler && wrangler login
mkdir informador-manises && cd informador-manises
# copia aquí worker.js i wrangler.toml
wrangler secret put SUPABASE_URL              # https://xxxx.supabase.co
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put LLM_API_KEY               # clau del model (OpenAI o compatible)
wrangler secret put GITHUB_KB_URL             # raw.githubusercontent.com/manises-ciutat-educadora/<repo>/main/oferta_formativa_manises.txt
wrangler deploy
```
L'URL del Worker (ex.: `https://informador-manises.<usuari>.workers.dev/api/chat`)
s'ha d'enganxar a la línia `API_URL` de `app.js`.

## Com funciona

1. L'usuari escriu o dicta una pregunta (en qualsevol de les 14 llengües).
2. El front-end envia `{pregunta, idioma, dia, hora, iso}` al Worker.
3. El Worker **grava la pregunta a Supabase** i després crida el LLM amb la base de
   coneixement completa (llegida del propi GitHub, amb caché d'1 h).
4. La resposta arriba en l'idioma de la pregunta, amb la regla estricta de no inventar
   dades i d'indicar el curs escolar de cada data/preu.
5. Si no hi ha connexió, la pregunta queda en cua al mòbil i s'envia en recuperar-la.

## Passos posteriors previstos

- Pasarel·la des de la web municipal (www.manises.es).
- Revisió nativa de tamazight / bamanankan / wolof.
- Ampliació de la base de coneixement (calendari 2027-2028 quan es publique).
