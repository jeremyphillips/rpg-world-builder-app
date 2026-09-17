import { describe, expect, it } from 'vitest'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'

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

const reincarnateEmbedHtml = `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="reincarnate-species"></div>`

describe('buildSpellCreateInput description tables', () => {
  it('omits tables when description embed was removed but form tables[] still has the row', () => {
    const input = buildSpellCreateInput(
      publishReadySpellFormValues({
        description: '<p>Embed removed by undo.</p>',
        tables: [reincarnateSpeciesTableFixture],
      }),
    )

    expect(input).not.toHaveProperty('tables')
  })

  it('prunes orphan tables when the embed was deleted from description', () => {
    const input = buildSpellCreateInput(
      publishReadySpellFormValues({
        description: '<p>Table deleted from prose.</p>',
        tables: [reincarnateSpeciesTableFixture],
      }),
    )

    expect(input.tables).toBeUndefined()
  })

  it('keeps only referenced tables when multiple rows exist but one embed remains', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }

    const input = buildSpellCreateInput(
      publishReadySpellFormValues({
        description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
        tables: [reincarnateSpeciesTableFixture, tableB],
      }),
    )

    expect(input.tables?.map((table) => table.id)).toEqual(['table-b'])
  })

  it('persists tables again after embed redo when form tables[] was kept in session', () => {
    const input = buildSpellCreateInput(
      publishReadySpellFormValues({
        description: reincarnateEmbedHtml,
        tables: [reincarnateSpeciesTableFixture],
      }),
    )

    expect(input.tables).toEqual([reincarnateSpeciesTableFixture])
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
