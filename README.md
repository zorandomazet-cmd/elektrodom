# ElektroDom V9

V9 je nadgradnja testne produkcijske osnove ElektroDom: nova vizualna identiteta, vektorski logotip, sodobnejši UX, razširjen katalog in robustnejši AI elektro svetovalec.

## Vsebina
- `index.html` — prenovljena domača stran
- `trgovina.html` — katalog
- `storitve.html` — storitve
- `vodniki.html` — vodiči
- `svetovalec.html` — AI svetovalec + testno povpraševanje
- `kontakt.html` — kontakt/povpraševanje
- `catalog.js` — demo katalog
- `chat-engine.js` — lokalna logika in fallback
- `functions/api/chat.js` — Cloudflare endpoint za AI
- `logo.svg` — vektorski logotip ElektroDom

## AI
Endpoint uporablja OpenAI Responses API. V Cloudflare nastavi secret `OPENAI_API_KEY`. Model lahko nastaviš z `OPENAI_MODEL`; privzeto je `gpt-5.6-luna`.

## Namestitev
1. Kopiraj vsebino mape v GitHub repo.
2. Commit + push.
3. Cloudflare naj naredi deployment.
4. Nastavi `OPENAI_API_KEY` kot Cloudflare Secret.
5. Odpri `/svetovalec.html` in preveri AI.

## Testni scenarij
`Rabim luč za kopalnico 8 m², stropno, do 50 €, pa montažo v Celju.` → `prvo` → `ja`.

## Pomembno
Katalog je demo. Pred produkcijo je treba podatke povezati z dejanskim katalogom, zalogo, cenami in preverjeno tehnično dokumentacijo. AI ni nadomestilo za električarja in ne sme potrjevati skladnosti konkretne instalacije brez pregleda.
