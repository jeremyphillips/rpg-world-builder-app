import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from '../character-builder/context'
import { builderTestCatalog, builderTestRules } from '../character-builder/test-fixtures'
import { deriveCharacterProfile } from './derive/profile'
import type { PcCharacter } from './sheet'
import { toCharacterSheetDerivationInput } from './sheet-derivation'

const catalogIndex = indexCharacterBuildCatalog(builderTestCatalog)

const samplePc = {
  id: 'char_1',
  characterType: 'pc',
  userId: 'user_1',
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
  connections: { organizations: [], locations: [] },
  feats: [],
  vital: { status: 'alive' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const satisfies PcCharacter

describe('toCharacterSheetDerivationInput', () => {
  it('maps a persisted PC into derivation input for deriveCharacterProfile', () => {
    const input = toCharacterSheetDerivationInput(samplePc, catalogIndex, builderTestRules)

    expect(input.level).toBe(1)
    expect(input.characterClass?.id).toBe('srd-cc-5.2.1:fighter')
    expect(input.abilityScores).toEqual(samplePc.abilityScores)

    const profile = deriveCharacterProfile(input)
    expect(profile.proficiencyBonus).toBe(2)
    expect(profile.maxHp).toBe(11)
    expect(profile.ac).toBe(12)
  })
})
