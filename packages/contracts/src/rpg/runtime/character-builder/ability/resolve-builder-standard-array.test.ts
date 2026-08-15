import { describe, expect, it } from 'vitest'

import { createCharacterBuildContext } from '../test-fixtures'
import {
  resolveBuilderStandardArray,
  usesLevelZeroStandardArray,
} from './resolve-builder-standard-array'

const PC_ARRAY = [16, 14, 13, 12, 10, 8] as const
const L0_ARRAY = [12, 11, 10, 9, 8, 7] as const

function createContextWithArrays(
  overrides: Parameters<typeof createCharacterBuildContext>[0] = {},
) {
  return createCharacterBuildContext({
    ...overrides,
    characterCreationRules: {
      ...createCharacterBuildContext().characterCreationRules,
      abilityGeneration: {
        ...createCharacterBuildContext().characterCreationRules.abilityGeneration,
        standardArray: [...PC_ARRAY],
      },
      levelZeroNpcs: {
        ...createCharacterBuildContext().characterCreationRules.levelZeroNpcs,
        enabled: true,
        standardArray: [...L0_ARRAY],
      },
      ...overrides.characterCreationRules,
    },
  })
}

describe('usesLevelZeroStandardArray', () => {
  it('is true for level 0 campaign NPCs when level zero NPCs are enabled', () => {
    const context = createContextWithArrays({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
    })

    expect(usesLevelZeroStandardArray(context, 0)).toBe(true)
  })

  it('is false for level 1+ NPCs', () => {
    const context = createContextWithArrays({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
    })

    expect(usesLevelZeroStandardArray(context, 1)).toBe(false)
  })

  it('is false for PCs at any level', () => {
    const context = createContextWithArrays({ characterKind: 'pc' })

    expect(usesLevelZeroStandardArray(context, 0)).toBe(false)
    expect(usesLevelZeroStandardArray(context, 1)).toBe(false)
  })
})

describe('resolveBuilderStandardArray', () => {
  it('returns the Level 0 array for level 0 NPCs', () => {
    const context = createContextWithArrays({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
    })

    expect(resolveBuilderStandardArray(context, 0)).toEqual([...L0_ARRAY])
  })

  it('returns the PC array for level 1+ NPCs', () => {
    const context = createContextWithArrays({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
    })

    expect(resolveBuilderStandardArray(context, 1)).toEqual([...PC_ARRAY])
    expect(resolveBuilderStandardArray(context, 5)).toEqual([...PC_ARRAY])
  })

  it('returns the PC array for PCs at any level', () => {
    const context = createContextWithArrays({ characterKind: 'pc' })

    expect(resolveBuilderStandardArray(context, 0)).toEqual([...PC_ARRAY])
    expect(resolveBuilderStandardArray(context, 3)).toEqual([...PC_ARRAY])
  })

  it('does not leak arrays between level 0 and level 1+ NPCs', () => {
    const context = createContextWithArrays({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
    })

    expect(resolveBuilderStandardArray(context, 0)).not.toEqual(
      resolveBuilderStandardArray(context, 1),
    )
  })
})
