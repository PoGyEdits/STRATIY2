# Kick Sub Goal Overlay (OBS)

Soubor `overlay.html` je web overlay pro OBS: čtvercový rámeček kolem webky se postupně vyplňuje podle sub goalu.

## URL parametry

- `channel` - kick kanál (default `Straty`)
- `goal` - cílový počet subů (default `25`)
- `title` - nadpis v overlay (default `Kick Sub Goal`)
- `size` - velikost čtverce v px (default `420`)
- `stroke` - tloušťka rámečku (default `16`)
- `radius` - zaoblení rohů (default `16`)
- `refreshMs` - interval obnovy dat (default `30000`)
- `subs` - ruční override počtu subů (když API nevrací sub count)
- `remaining` - ruční override zbývajících subů do cíle (alternativa k `subs`)
- `proxy=0` - vypne fallback čtení přes proxy (default je proxy zapnutá)

## Příklad URL

`https://TVUJ-ODKAZ/overlay.html?channel=Straty&goal=50&title=SUB%20GOAL&size=500&stroke=18`

Výchozí (proxy už je zapnutá):

`https://TVUJ-ODKAZ/overlay.html?channel=Straty&goal=50`

Spolehlivý fallback pro Straty (když Kick blokuje API):

`https://TVUJ-ODKAZ/overlay.html?channel=Straty&goal=200&subs=177`

## OBS nastavení

1. Přidej `Browser Source`.
2. Vlož URL s parametry.
3. Width a Height dej stejně jako `size` + prostor na popisek dole (např. 500x620).
4. Zapni `Refresh browser when scene becomes active`.

## Poznámka

Kick endpointy se mohou měnit. Pokud by nebyl dostupný veřejný sub count, použij dočasně `&subs=NN`.
