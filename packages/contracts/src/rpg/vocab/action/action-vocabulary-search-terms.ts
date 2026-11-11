/** Curated picker keywords for natural and special action vocabulary ids. */
export const ACTION_VOCABULARY_SEARCH_TERMS = {
  bite: ['teeth', 'jaws', 'mouth', 'pierce', 'piercing'],
  claw: ['claws', 'talons', 'slashing', 'rake'],
  slam: ['slam', 'bludgeon', 'limb', 'appendage', 'bludgeoning'],
  gore: ['horn', 'tusks', 'pierce', 'piercing', 'charge'],
  ram: ['ram', 'head', 'charge', 'bludgeoning'],
  sting: ['stinger', 'tail sting', 'pierce', 'poison'],
  tail: ['tail', 'whip', 'bludgeoning'],
  talons: ['talons', 'claws', 'bird', 'slashing', 'rake'],
  tentacle: ['tentacle', 'lash', 'grab', 'octopus', 'squeeze'],
  rend: ['rend', 'tear', 'claws', 'raking', 'extra damage'],
  constrict: ['constrict', 'squeeze', 'crush', 'grapple', 'snake'],
  'breath-weapon': ['breath', 'cone', 'exhale', 'dragon', 'fire breath'],
  multiattack: ['multiattack', 'multiple attacks', 'sequence', 'several attacks'],
  'frightful-presence': ['frighten', 'fear', 'presence', 'aura', 'wisdom save'],
} as const satisfies Record<string, readonly string[]>
