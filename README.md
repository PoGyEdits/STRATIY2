# Kick Sub Goal Overlay (OBS)

`overlay.html` je web overlay pro OBS a `api/subgoal.js` je backend endpoint pro automaticke nacitani sub goalu.

## Nasazeni (automaticke)

1. Importni tento repo do Vercel.
2. Deploy bez dalsi konfigurace (`vercel.json` uz je pripraveny).
3. V OBS pouzij URL:
`https://TVUJ-VERCEL-DOMAIN/overlay.html?channel=Straty&goal=200`

Overlay vola backend `https://TVUJ-VERCEL-DOMAIN/api/subgoal` automaticky.

## URL parametry overlaye

- `channel` - kick kanal (default `Straty`)
- `goal` - cilovy pocet subu (default `25`)
- `title` - nadpis v overlay (default `Kick Sub Goal`)
- `size` - velikost ctverce v px (default `420`)
- `stroke` - tloustka ramecku (default `16`)
- `radius` - zaobleni rohu (default `16`)
- `refreshMs` - interval obnovy dat (default `30000`)
- `api` - vlastni URL backend endpointu (default `/api/subgoal`)
- `subs` - rucni override aktualniho poctu (nouzove)
- `remaining` - rucni override zbyvajicich subu (nouzove)

## OBS nastaveni

1. Pridej `Browser Source`.
2. Vloz URL s parametry.
3. Width/Height nastav napriklad `500x620`.
4. Zapni `Refresh browser when scene becomes active`.
