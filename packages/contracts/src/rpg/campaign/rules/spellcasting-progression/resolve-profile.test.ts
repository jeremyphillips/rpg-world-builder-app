import { describe, expect, it } from 'vitest'

import type { Spellcasting } from '../../../content/classes/spellcasting'
import { spellcastingProgressionTestConfig, spellcastingProgressionTestSeed } from './fixtures'
import { resolveLeveledSlotCountsAtLevel } from './resolve-slots'
import {
  resolveSlotProgressionForClass,
  resolveSpellcastingProfileForClass,
  resolveSpellcastingProfileRecordForClass,
  resolveSpellsAvailableFromProfile,
} from './resolve-profile'
import { resolveSpellcastingProgressionRecords } from './patch'

describe('resolveSpellcastingProfileForClass', () => {
  const wizardClass = {
    spellcasting: {
      slotProgressionId: 'full-caster',
      profileId: 'fixture:wizard',
      ability: 'int' as const,
      level: 1,
    },
  }

  const bardLikeClass = {
    spellcasting: {
      slotProgressionId: 'full-caster',
      profileId: 'fixture:warlock',
      ability: 'cha' as const,
      level: 1,
    },
  }

  it('resolves slot progression and profile independently from class references', () => {
    const bundle = resolveSpellcastingProfileForClass(
      wizardClass,
      spellcastingProgressionTestConfig,
    )

    expect(bundle?.slotProgression.id).toBe('full-caster')
    expect(bundle?.profile.id).toBe('fixture:wizard')
  })

  it('returns null when slot progression id is missing', () => {
    expect(
      resolveSpellcastingProfileForClass(
        {
          spellcasting: {
            profileId: 'fixture:wizard',
            ability: 'int',
            level: 1,
          } as Spellcasting,
        },
        spellcastingProgressionTestConfig,
      ),
    ).toBeNull()
  })

  it('propagates shared slot progression edits to every referencing class without profile changes', () => {
    const fullCaster = spellcastingProgressionTestSeed.slotProgressions.find(
      (
        entry,
      ): entry is Extract<
        (typeof spellcastingProgressionTestSeed.slotProgressions)[number],
        { kind: 'leveled' }
      > => entry.id === 'full-caster' && entry.kind === 'leveled',
    )!
    const patched = resolveSpellcastingProgressionRecords(spellcastingProgressionTestSeed, {
      slotProgressions: [
        {
          ...fullCaster,
          rows: fullCaster.rows.map((row) => (row.level === 3 ? { ...row, slots: [4, 3] } : row)),
        },
      ],
    })
    const config = {
      slotProgressions: new Map(patched.slotProgressions.map((entry) => [entry.id, entry])),
      profiles: spellcastingProgressionTestConfig.profiles,
    }

    const wizardSlots = resolveLeveledSlotCountsAtLevel(
      resolveSlotProgressionForClass(wizardClass, config)!,
      3,
    ).slots
    const bardLikeSlots = resolveLeveledSlotCountsAtLevel(
      resolveSlotProgressionForClass(bardLikeClass, config)!,
      3,
    ).slots

    expect(wizardSlots[1]).toBe(3)
    expect(bardLikeSlots[1]).toBe(3)
    expect(
      resolveSpellsAvailableFromProfile(
        resolveSpellcastingProfileRecordForClass(wizardClass, config)!,
        1,
      ),
    ).toBe(4)
    expect(
      resolveSpellsAvailableFromProfile(
        resolveSpellcastingProfileRecordForClass(bardLikeClass, config)!,
        1,
      ),
    ).toBe(2)
  })
})
