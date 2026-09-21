import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestConfig } from '../../../../campaign/rules/spellcasting-progression/fixtures'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import type { CharacterBuilderDraft } from '../../draft/draft'
import {
  nonCasterClass,
  paladinClass,
  spellcastingTestContext,
  warlockClass,
  wizardClass,
} from '../../spellcasting-test-fixtures'
import {
  cantripsKnownAtLevel,
  maxSelectableSpellLevel,
  spellsAvailableAtLevel,
} from '../../../creature/spellcasting'
import { resolveSpellcastingProfile } from './builder-spellcasting'

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

describe('spellcasting-profile', () => {
  it('returns null for classes without spellcasting', () => {
    const draft = draftWith({
      class: { classId: nonCasterClass.id, level: 1 },
    })

    expect(resolveSpellcastingProfile(draft, spellcastingTestContext)).toBeNull()
  })

  it('returns null when spellcasting unlocks above the draft level', () => {
    const delayedCaster = {
      ...wizardClass,
      features: wizardClass.features.map((feature) =>
        feature.id === 'spellcasting' ? { ...feature, level: 2 } : feature,
      ),
    }
    const context = {
      ...spellcastingTestContext,
      catalog: {
        ...spellcastingTestContext.catalog,
        classes: [delayedCaster],
      },
    }
    const draft = draftWith({
      class: { classId: delayedCaster.id, level: 1 },
    })

    expect(resolveSpellcastingProfile(draft, context)).toBeNull()
  })

  it('builds a full profile for a level-1 wizard', () => {
    const draft = draftWith({
      class: { classId: wizardClass.id, level: 1 },
    })

    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)

    expect(profile).toMatchObject({
      classId: wizardClass.id,
      className: 'Wizard',
      ability: 'int',
      classLevel: 1,
      usesPreparedLoadout: true,
      cantripsKnown: 3,
      spellsAvailable: 4,
      maxSelectableSpellLevel: 1,
    })
    expect(profile?.resolved.choiceProgressions.map((entry) => entry.suffix)).toEqual([
      'cantrips',
      'spellbook',
      'prepared',
    ])
  })

  it('omits cantrip quota for paladin-style zero-cantrip casters', () => {
    const draft = draftWith({
      class: { classId: paladinClass.id, level: 1 },
    })

    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)

    expect(profile?.cantripsKnown).toBe(0)
  })

  it('produces a pact-slot level-1 profile for warlock', () => {
    const draft = draftWith({
      class: { classId: warlockClass.id, level: 1 },
    })

    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)

    expect(profile).toMatchObject({
      cantripsKnown: 2,
      spellsAvailable: 2,
      maxSelectableSpellLevel: 1,
    })
    expect(
      maxSelectableSpellLevel(warlockClass.spellcasting!, 1, spellcastingProgressionTestConfig),
    ).toBe(1)
  })

  it('reads progression tables at the requested class level', () => {
    const spellcasting = wizardClass.spellcasting!

    expect(cantripsKnownAtLevel(wizardClass, 1)).toBe(3)
    expect(spellsAvailableAtLevel(spellcasting, 1, spellcastingProgressionTestConfig)).toBe(4)
    expect(maxSelectableSpellLevel(spellcasting, 1, spellcastingProgressionTestConfig)).toBe(1)
  })
})
