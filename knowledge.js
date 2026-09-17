export const KNOWLEDGE = {
  lighting: [
    'Pri izbiri svetila upoštevaj namen prostora, približno potrebno svetilnost, barvno temperaturo, način montaže in okoljske pogoje.',
    'Lumni opisujejo količino svetlobe; moč v W sama po sebi ne pove, kako svetel bo prostor.',
    'IP zaščita je pomembna pri vlagi, vendar sama oznaka IP ne določa, ali je svetilo dovoljeno na vseh mestih v kopalnici. Pomembni so tudi območje, položaj in izvedba.',
    'Za bivalne prostore je 3000 K običajno toplejša, 4000 K pa bolj nevtralna svetloba.'
  ],
  sockets: [
    'Pri vtičnicah preveri prostor, namen uporabe, pogoje vlage, zahtevano zaščito in združljivost z obstoječim sistemom.',
    'V kopalnici sama izbira vtičnice z določeno IP oznako ni dovolj za presojo konkretne dovoljene namestitve.'
  ],
  protection: [
    'B16 je oznaka karakteristike in nazivnega toka avtomatskega odklopnika; pravilna izbira je odvisna od tokokroga, vodnikov in načina izvedbe.',
    'RCD/FID z nazivnim diferenčnim tokom 30 mA je zaščitna naprava, namenjena dodatni zaščiti pred električnim udarom, vendar mora biti tip in izvedba ustrezna konkretnemu sistemu.',
    'Pri posegih v razdelilnik, menjavi zaščitnih naprav in delu na instalaciji je potreben strokovni pregled.'
  ],
  safety: [
    'Vonj po zažganem, dim, iskrenje ali nenavadno segrevanje električne opreme so razlog za prekinitev uporabe in strokovni pregled.',
    'Ne dajaj navodil za delo na izpostavljenih delih instalacije ali pod napetostjo.'
  ],
  cable: [
    'Prerez kabla se ne izbira samo po želji uporabnika; pomembni so tokokrog, dolžina, način polaganja, obremenitev, zaščita in drugi pogoji.',
    'Konkretno dimenzioniranje instalacije naj potrdi usposobljen električar.'
  ]
};

export function knowledgeFor(intent) {
  if (intent === 'svetilo') return KNOWLEDGE.lighting;
  if (intent === 'vtičnica') return KNOWLEDGE.sockets;
  if (intent === 'zaščita') return KNOWLEDGE.protection;
  if (intent === 'kabel') return KNOWLEDGE.cable;
  return [];
}
