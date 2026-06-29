import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSpells } from '@rpg/catalog/spells'
import { createSpellInputSchema, deriveContentKey, type CreateSpellInput } from '@rpg/contracts'
import type { FormItem, GroupConfig, RowConfig } from '@rpg/ui/form'

import { spellFormDef, type SpellFormValues } from './spell-form-def'

const SRD_SPELLS = loadSeedSpells('srd-cc-5.2.1')

function findGroup(fields: FormItem[], legend: string): GroupConfig | undefined {
  return fields.find(
    (field): field is GroupConfig =>
      'kind' in field && field.kind === 'group' && field.legend === legend,
  )
}

function findRow(fields: GroupConfig['fields']): RowConfig | undefined {
  return fields.find((field): field is RowConfig => 'kind' in field && field.kind === 'row')
}

it('type: toInput return type matches CreateSpellInput', () => {
  expectTypeOf(spellFormDef.toInput).returns.toEqualTypeOf<CreateSpellInput>()
})

describe('spellFormDef round-trips', () => {
  for (const spell of SRD_SPELLS) {
    it(`${spell.slug}: toFormValues → toInput → schema.parse`, () => {
      const formValues = spellFormDef.toFormValues(spell) as SpellFormValues
      const input = spellFormDef.toInput(formValues)
      expect(() => createSpellInputSchema.parse(input)).not.toThrow()
    })

    it(`${spell.slug}: name and school preserved`, () => {
      const formValues = spellFormDef.toFormValues(spell) as SpellFormValues
      const input = spellFormDef.toInput(formValues)
      expect(input.name).toBe(spell.name)
      expect(input.school).toBe(spell.school)
    })
  }
})

describe('spellFormDef casting fields', () => {
  it('uses inputSelect for normal casting time with ritual switch in the same row', () => {
    const castingTab = spellFormDef.buildTabs!({}).find((tab) => tab.id === 'casting')
    const castingTimeGroup = findGroup(castingTab?.fields ?? [], 'Casting time')
    expect(castingTimeGroup?.kind).toBe('group')

    const row = findRow(castingTimeGroup?.fields ?? [])
    expect(row?.kind).toBe('row')
    expect(row).not.toHaveProperty('className')

    expect(row?.fields).toEqual([
      expect.objectContaining({
        type: 'inputSelect',
        name: 'castingTime.normal',
        valueKey: 'value',
        unitKey: 'unit',
        width: 'auto',
      }),
      expect.objectContaining({
        type: 'switch',
        name: 'castingTime.canBeCastAsRitual',
        labelPosition: 'above',
        width: 'auto',
      }),
    ])
  })
})

describe('spellFormDef component fields', () => {
  it('lays out V/S/M switches in a row and conditionally shows material description', () => {
    const castingTab = spellFormDef.buildTabs!({}).find((tab) => tab.id === 'casting')
    const componentsGroup = findGroup(castingTab?.fields ?? [], 'Components')
    const row = findRow(componentsGroup?.fields ?? [])

    expect(row?.kind).toBe('row')
    expect(row).not.toHaveProperty('className')
    expect(row?.fields).toEqual([
      expect.objectContaining({ name: 'components.verbal', width: 'auto' }),
      expect.objectContaining({ name: 'components.somatic', width: 'auto' }),
      expect.objectContaining({ name: 'components.material.enabled', width: 'auto' }),
    ])

    const descriptionField = componentsGroup?.fields.find(
      (field) => !('kind' in field) && field.name === 'components.material.description',
    )
    expect(descriptionField).toEqual(
      expect.objectContaining({
        type: 'text',
        required: true,
        visibility: expect.objectContaining({
          dependsOn: ['components.material.enabled'],
        }),
      }),
    )
  })
})

describe('spellFormDef duration fields', () => {
  it('lays out duration kind, timed inputSelect, and upTo switch in a row at natural width', () => {
    const castingTab = spellFormDef.buildTabs!({}).find((tab) => tab.id === 'casting')
    const durationGroup = findGroup(castingTab?.fields ?? [], 'Duration')
    const row = durationGroup?.fields.find(
      (field): field is RowConfig => 'kind' in field && field.kind === 'row',
    )

    expect(row?.kind).toBe('row')
    expect(row).not.toHaveProperty('layout')
    expect(row?.fields).toEqual([
      expect.objectContaining({
        type: 'select',
        name: 'duration.kind',
        width: 'lg',
      }),
      expect.objectContaining({
        type: 'inputSelect',
        name: 'duration',
        valueKey: 'value',
        unitKey: 'unit',
        width: 'auto',
        defaultValue: { value: 1, unit: 'round' },
      }),
      expect.objectContaining({ name: 'duration.upTo', width: 'auto' }),
    ])
  })
})

describe('spellFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues = {
      ...spellFormDef.createDefaultValues,
      name: 'Custom Bolt',
      school: 'evocation',
      classIds: ['wizard'],
    } as SpellFormValues
    const input = spellFormDef.toInput(formValues)
    expect(input.slug).toBe(deriveContentKey('Custom Bolt'))
  })

  it('update: omits slug when entity context is present', () => {
    const spell = SRD_SPELLS[0]!
    const formValues = spellFormDef.toFormValues(spell) as SpellFormValues
    formValues.name = 'Renamed Spell'
    const input = spellFormDef.toInput(formValues, { entity: spell })
    expect(input).not.toHaveProperty('slug')
    expect(input.name).toBe('Renamed Spell')
  })
})
