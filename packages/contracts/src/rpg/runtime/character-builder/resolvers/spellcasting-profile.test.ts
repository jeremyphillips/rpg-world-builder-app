import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft'
import type { CharacterBuilderDraft } from '../draft'
import {
  nonCasterClass,
  paladinClass,
  spellcastingTestContext,
  warlockClass,
  wizardClass,
} from '../spellcasting-test-fixtures'
import {
  cantripsKnownAtLevel,
  maxSelectableSpellLevel,
  resolveSpellcastingProfile,
  spellsAvailableAtLevel,
} from './spellcasting-profile'

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
      spellcasting: {
        ...wizardClass.spellcasting!,
        level: 2,
      },
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

    expect(resolveSpellcastingProfile(draft, spellcastingTestContext)).toEqual({
      classId: wizardClass.id,
      className: 'Wizard',
      ability: 'int',
      preparation: 'prepared',
      cantripsKnown: 3,
      spellsAvailable: 4,
      maxSelectableSpellLevel: 1,
      choiceSetIds: {
        cantrips: `spellcasting:${wizardClass.id}:cantrips`,
        spells: `spellcasting:${wizardClass.id}:spells`,
      },
    })
  })

  it('omits cantrip choice set ids for paladin and ranger-style zero-cantrip casters', () => {
    const draft = draftWith({
      class: { classId: paladinClass.id, level: 1 },
    })

    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)

    expect(profile?.cantripsKnown).toBe(0)
    expect(profile?.choiceSetIds.cantrips).toBeUndefined()
    expect(profile?.choiceSetIds.spells).toBe(`spellcasting:${paladinClass.id}:spells`)
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
    expect(maxSelectableSpellLevel(warlockClass.spellcasting!, 1)).toBe(1)
  })

  it('reads progression tables at the requested class level', () => {
    const spellcasting = wizardClass.spellcasting!

    expect(cantripsKnownAtLevel(spellcasting, 1)).toBe(3)
    expect(spellsAvailableAtLevel(spellcasting, 1)).toBe(4)
    expect(maxSelectableSpellLevel(spellcasting, 1)).toBe(1)
  })
})
