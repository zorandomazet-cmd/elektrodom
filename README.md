# ElektroDom V7

Modernizirana produkcijska osnova za spletno trgovino z elektro materialom in električarskimi storitvami.

## Kaj je vključeno
- sodobna responsive spletna stran z več vsebinskimi podstranmi/sekcijami: trgovina, storitve, vodniki, AI pomočnik, povpraševanje, kontakt;
- produktni katalog in filtriranje;
- košarica;
- AI-style svetovalni pogovor z razumevanjem naravnega jezika;
- kombinacija material + storitev + lokacija;
- priporočanje svetil glede na prostor/površino/proračun;
- prepoznavanje lokacij in pogostih tipkarskih napak;
- lead flow;
- varnostna meja pri 230 V, varovalkah in FID/RCD;
- ločen `chat-engine.js`, ki ga je mogoče kasneje zamenjati z dejanskim LLM/backendom.

## Namestitev
Za statični deployment naložite vse tri datoteke (`index.html`, `styles.css`, `app.js`, `chat-engine.js`) v isti direktorij.

## Pomembno za produkcijo
To je produkcijska **frontend osnova**, ne še dejanska produkcijska e-trgovina. Pred javno uporabo je treba dodati backend/API, realni katalog in zalogo, plačila, avtorizacijo, GDPR/cookie mehanizem, strežniško validacijo, CRM, logging, rate limiting in pravo LLM integracijo.
