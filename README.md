# Kick Sub Goal Overlay (OBS)

`overlay.html` je web overlay pro OBS.
Rezim bez pristupu k uctu: nastav startovni `subs` a overlay pak automaticky pricita nove suby z verejnych Kick chat eventu.

## Doporuceny URL (Straty)

`https://TVUJ-VERCEL-DOMAIN/overlay.html?channel=Straty&goal=200&subs=177`

- `subs=177` je start na zacatku streamu
- behem streamu se pocitadlo samo zvysuje podle live sub/gift sub eventu

## URL parametry

- `channel` - kick kanal (default `Straty`)
- `goal` - cilovy pocet subu (default `25`)
- `subs` - startovni aktualni pocet subu (doporučeno)
- `remaining` - alternativa ke `subs` (kolik zbyva)
- `live=0` - vypne live websocket pricitani
- `chatroomId` - rucni chatroom ID (volitelne)
- `chatApi` - endpoint pro zjisteni chatroom ID (default `/api/chatroom`)
- `api` - endpoint pro auto nacteni full stavu (default `/api/subgoal`, volitelne)
- `title`, `size`, `stroke`, `radius`, `refreshMs` - vzhled

## OBS

1. Pridej `Browser Source`.
2. Vloz URL.
3. Nastav Width/Height napr. `500x620`.
4. Zapni `Refresh browser when scene becomes active`.

## Poznamka

Kick muze blokovat prime API cteni. Proto je nejstabilnejsi pouzit `subs` jako start a nechat live websocket pricitani behem streamu.
