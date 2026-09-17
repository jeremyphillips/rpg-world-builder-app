import { describe, expect, it } from 'vitest'

import { makeSpell } from '@/test/fixtures/factories/spell'

import {
  buildSpellCreateInput,
  spellCreateDefaultValues,
  SPELL_SCALING_FORM_DEFAULTS,
  spellScalingProseFromForm,
  spellScalingTogglesFromStored,
  spellToFormValues,
} from './spell-form-values'
import type { SpellFormValues } from './spell-form-fields'

function publishReadySpellFormValues(overrides: Partial<SpellFormValues> = {}): SpellFormValues {
  return {
    name: 'Test Spell',
    school: 'evocation',
    level: 1,
    classIds: ['wizard'],
    castingTime: {
      normal: { value: 1, unit: 'action' },
      canBeCastAsRitual: false,
    },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    areaOfEffect: spellCreateDefaultValues.areaOfEffect!,
    effects: [],
    ...SPELL_SCALING_FORM_DEFAULTS,
    ...overrides,
  } as SpellFormValues
}

describe('SPELL_SCALING_FORM_DEFAULTS', () => {
  it('keeps scaling toggles off in create defaults', () => {
    expect(spellCreateDefaultValues.hasCantripScaling).toBe(false)
    expect(spellCreateDefaultValues.hasHigherLevelSlotEffect).toBe(false)
  })
})

describe('spellScalingTogglesFromStored', () => {
  it('derives toggles from non-empty scaling prose', () => {
    expect(
      spellScalingTogglesFromStored({
        cantripScaling: '<p>At 5th level, the range increases.</p>',
        higherLevelSlotEffect: '<p>Damage increases by 1d6 per slot above 1.</p>',
      }),
    ).toEqual({
      hasCantripScaling: true,
      hasHigherLevelSlotEffect: true,
    })
  })

  it('treats empty rich text as disabled toggles', () => {
    expect(
      spellScalingTogglesFromStored({
        cantripScaling: '<p></p>',
        higherLevelSlotEffect: '   ',
      }),
    ).toEqual({
      hasCantripScaling: false,
      hasHigherLevelSlotEffect: false,
    })
  })
})

describe('spellScalingProseFromForm', () => {
  it('strips empty rich text before wire', () => {
    expect(
      spellScalingProseFromForm({
        cantripScaling: '<p></p>',
        higherLevelSlotEffect: '<p>Targets one additional creature for each slot above 1.</p>',
      }),
    ).toEqual({
      cantripScaling: undefined,
      higherLevelSlotEffect: '<p>Targets one additional creature for each slot above 1.</p>',
    })
  })
})

describe('spellToFormValues scaling toggles', () => {
  it('hydrates form-only toggles from stored scaling prose', () => {
    expect(
      spellToFormValues(
        makeSpell({
          level: 0,
          cantripScaling: '<p>At 5th level, the range increases.</p>',
        }),
      ),
    ).toMatchObject({
      hasCantripScaling: true,
      hasHigherLevelSlotEffect: false,
      cantripScaling: '<p>At 5th level, the range increases.</p>',
    })
  })
})

describe('buildSpellCreateInput scaling prose', () => {
  it('omits form-only toggles and empty scaling prose from publish input', () => {
    const input = buildSpellCreateInput(
      publishReadySpellFormValues({
        hasCantripScaling: true,
        hasHigherLevelSlotEffect: true,
        cantripScaling: '<p></p>',
        higherLevelSlotEffect: '<p>Damage increases by 1d6 per slot above 1.</p>',
      }),
    )

    expect(input).not.toHaveProperty('hasCantripScaling')
    expect(input).not.toHaveProperty('hasHigherLevelSlotEffect')
    expect(input.cantripScaling).toBeUndefined()
    expect(input.higherLevelSlotEffect).toBe('<p>Damage increases by 1d6 per slot above 1.</p>')
  })
})
