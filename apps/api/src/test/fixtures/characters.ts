import type { CreateCharacterInput } from '@rpg/contracts'

/** Minimal level-1 standalone PC input for character API integration tests. */
export const minimalStandalonePcInput: CreateCharacterInput = {
  characterType: 'pc',
  campaignId: null,
  name: 'Verna',
  rulesetId: 'srd-cc-5.2.1',
  classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 1 }],
  species: { id: 'srd-cc-5.2.1:dwarf' },
  alignment: 'ng',
  xp: 0,
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  hitPoints: { base: 11, current: 11, temporary: 0 },
  proficiencies: {
    skills: [],
    weapons: [
      {
        weaponCategory: 'simple',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'weapon-proficiencies',
          },
        ],
      },
    ],
    armor: [
      {
        armorCategory: 'light',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'armor-proficiencies',
          },
        ],
      },
    ],
    tools: [],
    languages: [],
  },
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
}
