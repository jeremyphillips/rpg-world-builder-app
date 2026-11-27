import { describe, expect, it } from 'vitest'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'
import type { FormIssue } from '@rpg/ui/form'

import { mapWireIssuesToAuthoring } from '../../lib/forms/submit/map-wire-issues-to-authoring.lib'
import { spellFormSchema, type SpellFormValues } from './spell-form-fields'
import {
  buildSpellPreparedWrite,
  spellCreateDefaultValues,
  SPELL_SCALING_FORM_DEFAULTS,
} from './spell-form-values'

const issue = (path: string): FormIssue => ({ path, message: 'bad', severity: 'field' })

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

describe('buildSpellPreparedWrite provenance', () => {
  it('maps slug wire paths to the name authoring owner', () => {
    const { provenance } = buildSpellPreparedWrite(
      publishReadySpellFormValues({ name: 'Fire Bolt' }),
      undefined,
      'publish',
    )
    const { issues } = mapWireIssuesToAuthoring([issue('slug')], provenance)
    expect(issues[0]!.path).toBe('name')
  })

  it('records description table pruning by source row id, not wire index alone', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }
    const values = publishReadySpellFormValues({
      description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
      tables: [reincarnateSpeciesTableFixture, tableB],
    })
    const { provenance } = buildSpellPreparedWrite(values, undefined, 'publish')
    expect(provenance.filteredRowIndexBySourceIndex?.tables).toEqual({ 1: 0 })
    const { issues } = mapWireIssuesToAuthoring([issue('tables.0.name')], provenance)
    expect(issues[0]!.path).toBe('tables.1.name')
  })
})
