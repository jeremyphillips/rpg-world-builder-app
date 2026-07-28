import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import type { CharacterBuilderDraft } from '../../draft/draft'
import {
  nonCasterClass,
  spellcastingTestContext,
  wizardClass,
} from '../../spellcasting-test-fixtures'
import { resolveSpellStepApplicability } from './resolve-spell-step-applicability'

function draftWith(overrides: Partial<CharacterBuilderDraft>): CharacterBuilderDraft {
  return { ...createEmptyCharacterBuilderDraft(), ...overrides }
}

describe('resolveSpellStepApplicability', () => {
  it('returns blocked when no class is selected', () => {
    expect(resolveSpellStepApplicability(draftWith({}), spellcastingTestContext)).toEqual({
      kind: 'blocked',
    })
  })

  it('returns notApplicable for non-casters', () => {
    expect(
      resolveSpellStepApplicability(
        draftWith({ class: { classId: nonCasterClass.id, level: 1 } }),
        spellcastingTestContext,
      ),
    ).toEqual({
      kind: 'notApplicable',
      reason: 'noSpellcasting',
      className: 'Fighter',
      level: 1,
    })
  })

  it('returns notApplicable when spellcasting unlocks above the draft level', () => {
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

    expect(
      resolveSpellStepApplicability(
        draftWith({ class: { classId: delayedCaster.id, level: 1 } }),
        context,
      ),
    ).toEqual({
      kind: 'notApplicable',
      reason: 'inactiveAtLevel',
      className: 'Wizard',
      level: 1,
    })
  })

  it('returns applicable with profile for active casters', () => {
    const result = resolveSpellStepApplicability(
      draftWith({ class: { classId: wizardClass.id, level: 1 } }),
      spellcastingTestContext,
    )

    expect(result.kind).toBe('applicable')
    if (result.kind !== 'applicable') return

    expect(result.profile).toMatchObject({
      classId: wizardClass.id,
      className: 'Wizard',
      cantripsKnown: 3,
      spellsAvailable: 4,
    })
  })
})
