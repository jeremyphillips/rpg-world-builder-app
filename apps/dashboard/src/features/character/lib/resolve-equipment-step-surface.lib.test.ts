import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  type CharacterClass,
  type ResolvedStartingEquipmentFunding,
} from '@rpg/contracts'

import { resolveEquipmentStepSurface } from './resolve-equipment-step-surface.lib'

const emptyWealth = { cp: 0, sp: 0, gp: 0, pp: 0 } as const

function makeFunding(
  overrides: Pick<ResolvedStartingEquipmentFunding, 'classOptionPolicy'> & {
    tierLabel?: string
    classOptionId?: string
  },
): ResolvedStartingEquipmentFunding {
  return {
    classOptionWealth: emptyWealth,
    tierAdditionalWealth: emptyWealth,
    totalStartingWealth: emptyWealth,
    ...overrides,
  }
}

const fighterClass = {
  id: 'srd-cc-5.2.1:fighter',
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        { id: 'pack-a', label: 'Pack A', items: [] },
        { id: 'pack-b', label: 'Pack B', items: [] },
      ],
    },
  },
} as unknown as CharacterClass

describe('resolveEquipmentStepSurface', () => {
  it('reports class_missing when no class is selected', () => {
    const result = resolveEquipmentStepSurface({
      draft: createEmptyCharacterBuilderDraft(),
      characterClass: undefined,
      classId: undefined,
      stepModel: undefined,
      summaries: [],
      selectedOptionId: undefined,
    })

    expect(result).toEqual({ status: 'unavailable', reason: 'class_missing' })
  })

  it('reports class_not_in_catalog when the class id is unknown', () => {
    const result = resolveEquipmentStepSurface({
      draft: {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: 'missing-class', level: 1 },
      },
      characterClass: undefined,
      classId: 'missing-class',
      stepModel: undefined,
      summaries: [],
      selectedOptionId: undefined,
    })

    expect(result).toEqual({ status: 'unavailable', reason: 'class_not_in_catalog' })
  })

  it('does not fall back to the first funding source when no package is selected', () => {
    const result = resolveEquipmentStepSurface({
      draft: {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: fighterClass.id, level: 1 },
      },
      characterClass: fighterClass,
      classId: fighterClass.id,
      stepModel: {
        fundingByOptionId: new Map<string, ResolvedStartingEquipmentFunding>([
          [
            'pack-a',
            makeFunding({
              classOptionId: 'pack-a',
              classOptionPolicy: 'replaced',
              tierLabel: 'First package',
            }),
          ],
          [
            'pack-b',
            makeFunding({
              classOptionId: 'pack-b',
              classOptionPolicy: 'included',
              tierLabel: 'Second package',
            }),
          ],
        ]),
        selectedOptionId: undefined,
        currentFunding: undefined,
      },
      summaries: [],
      selectedOptionId: undefined,
    })

    expect(result.status).toBe('available')
    if (result.status !== 'available') return

    expect(result.surface.classOptionPolicy).toBe('included')
    expect(result.surface.tierLabel).toBeUndefined()
    expect(result.surface.classOptionsReplaced).toBe(false)
  })

  it('reports funding_context_missing when a selected package lacks funding', () => {
    const result = resolveEquipmentStepSurface({
      draft: {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: fighterClass.id, level: 1 },
        choiceSelections: { [`class:${fighterClass.id}:starting-equipment`]: ['pack-a'] },
      },
      characterClass: fighterClass,
      classId: fighterClass.id,
      stepModel: {
        fundingByOptionId: new Map(),
        selectedOptionId: 'pack-a',
        currentFunding: undefined,
      },
      summaries: [],
      selectedOptionId: 'pack-a',
    })

    expect(result).toEqual({ status: 'unavailable', reason: 'funding_context_missing' })
  })
})
