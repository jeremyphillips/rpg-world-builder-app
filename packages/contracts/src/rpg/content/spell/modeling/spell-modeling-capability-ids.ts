/** Spell-domain modeling capability IDs — extensible without touching primitive schema. */
export const SPELL_MODELING_CAPABILITY_IDS = {
  'stat-modifier': 'AC, speed, HP max, and roll bonuses',
  condition: 'Apply, remove, and save-or-suffer control effects',
  movement: 'Teleport, push/pull, jump, and forced movement',
  'action-grant': 'Bonus or delegated action economy',
  detection: 'Sensing and identification',
  illusion: 'Visual and textual illusion authoring',
  'spell-negation': 'Counter, dispel, and interrupt ongoing spells',
  'persistent-zone': 'Darkness, fog, glyph traps, and ongoing auras',
  'information-reveal': 'Object and creature information reveal',
} as const

export type SpellModelingCapabilityId = keyof typeof SPELL_MODELING_CAPABILITY_IDS

export function isSpellModelingCapabilityId(id: string): id is SpellModelingCapabilityId {
  return id in SPELL_MODELING_CAPABILITY_IDS
}
