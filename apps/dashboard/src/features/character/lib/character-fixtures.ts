import type { PcCharacter } from '@rpg/contracts'

/** Minimal persisted PC for character detail stories and tests. */
export const SAMPLE_PC: PcCharacter = {
  id: 'char-sample-1',
  characterType: 'pc',
  userId: 'user-sample',
  campaignId: null,
  name: 'Verna',
  rulesetId: 'srd-cc-5.2.1',
  classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }],
  species: { id: 'srd-cc-5.2.1:dwarf' },
  alignment: 'ng',
  xp: 0,
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  hitPoints: { base: 11, current: 11, temporary: 0 },
  proficiencies: { skills: [], weapons: [], armor: [], tools: [], languages: [] },
  spells: [],
  equipment: {
    weapons: [],
    armor: [],
    tools: [],
    gear: [],
    magicItems: [],
    vehicles: [],
    mounts: [],
  },
  wealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
  feats: [],
  lifecycle: {
    roster: { status: 'active' },
    vital: { status: 'alive' },
  },
  narrative: { backstory: 'A hardy dwarf fighter from the northern holds.' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}
