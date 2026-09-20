import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestSeed } from './fixtures'
import {
  computeSpellcastingProgressionSparsePatch,
  resolveSpellcastingProgressionRecords,
} from './patch'

describe('computeSpellcastingProgressionSparsePatch', () => {
  it('returns undefined when resolved matches seed', () => {
    expect(
      computeSpellcastingProgressionSparsePatch(
        spellcastingProgressionTestSeed,
        spellcastingProgressionTestSeed,
      ),
    ).toBeUndefined()
  })

  it('includes only slot progressions that differ from seed', () => {
    const fullCaster = spellcastingProgressionTestSeed.slotProgressions.find(
      (
        entry,
      ): entry is Extract<
        (typeof spellcastingProgressionTestSeed.slotProgressions)[number],
        { kind: 'leveled' }
      > => entry.id === 'full-caster' && entry.kind === 'leveled',
    )!
    const resolved = resolveSpellcastingProgressionRecords(spellcastingProgressionTestSeed, {
      slotProgressions: [
        {
          ...fullCaster,
          rows: [{ level: 1, slots: [3] }],
        },
      ],
    })

    const patch = computeSpellcastingProgressionSparsePatch(
      resolved,
      spellcastingProgressionTestSeed,
    )

    expect(patch?.slotProgressions).toHaveLength(1)
    expect(patch?.slotProgressions?.[0]?.id).toBe('full-caster')
    expect(patch?.profiles).toBeUndefined()
  })

  it('includes custom records not present in seed', () => {
    const customProfile = {
      id: 'custom:test',
      label: 'Custom profile',
      choiceProgressions: [],
    }
    const resolved = resolveSpellcastingProgressionRecords(spellcastingProgressionTestSeed, {
      profiles: [customProfile],
    })

    const patch = computeSpellcastingProgressionSparsePatch(
      resolved,
      spellcastingProgressionTestSeed,
    )

    expect(patch?.profiles).toEqual([customProfile])
  })
})
