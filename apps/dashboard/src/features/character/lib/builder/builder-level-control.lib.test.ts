import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveBuilderLevelConstraints } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../character-builder-fixtures'
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
})
