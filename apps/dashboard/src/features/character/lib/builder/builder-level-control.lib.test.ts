import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  resolveBuilderLevelConstraints,
  sanitizeClassForLevel,
} from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../character-builder-fixtures'
import {
  buildBuilderLevelSelectOptions,
  evaluateBuilderLevelChange,
} from './builder-level-control.lib'

describe('builder-level-control.lib', () => {
  const context = createStandaloneBuilderContextFixture()
  const constraints = resolveBuilderLevelConstraints(context)

  it('builds level options within campaign maximum', () => {
    const options = buildBuilderLevelSelectOptions(constraints)
    expect(options).toHaveLength(20)
    expect(options[0]).toMatchObject({ value: '1', label: '1' })
    expect(options[19]).toMatchObject({ value: '20', label: '20' })
  })

  it('applies level changes without confirmation when selections remain valid', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    }

    const result = evaluateBuilderLevelChange(draft, 2, context)
    expect(result).toMatchObject({
      kind: 'apply',
      nextDraft: {
        class: { classId: 'srd-cc-5.2.1:fighter', level: 2 },
      },
    })
  })

  it('strips class identity when changing to level 0', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    }

    const npcContext = createCampaignNpcBuilderContextFixture()

    const result = evaluateBuilderLevelChange(draft, 0, npcContext)
    expect(result).toMatchObject({
      kind: 'apply',
      nextDraft: {
        class: { level: 0, classId: undefined },
      },
    })
    expect(sanitizeClassForLevel(result.kind === 'apply' ? result.nextDraft : draft).class).toEqual(
      {
        level: 0,
        classId: undefined,
      },
    )
  })
})
