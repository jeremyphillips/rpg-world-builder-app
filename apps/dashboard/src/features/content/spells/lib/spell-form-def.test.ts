import { describe, expect, expectTypeOf, it } from 'vitest'
import { loadSeedSpells } from '@rpg/catalog/spells'
import {
  createSpellInputSchema,
  deriveContentKey,
  ELDRITCH_BLAST_RESOLUTION,
  type CreateSpellInput,
  type Spell,
} from '@rpg/contracts'
import type { FormItem, GroupConfig, RowConfig, ArrayConfig } from '@rpg/ui/form'

import { RESOLUTION_FORM_FIXTURES } from '../resolution/fixtures'
import { spellFormDef, spellFormSchema, type SpellFormValues } from './spell-form-def'
import { RESOLUTION_SECTION_LABELS } from '../resolution/lib/form/resolution-form-labels'

const SRD_SPELLS = loadSeedSpells('srd-cc-5.2.1')

function findGroup(fields: FormItem[], legend: string): GroupConfig | undefined {
  for (const field of fields) {
    if ('kind' in field && field.kind === 'group') {
      if (field.legend === legend) return field
      const nested = findGroup(field.fields, legend)
      if (nested) return nested
    }
  }

  return undefined
}

function walkNestedFormItems(fields: FormItem[], visit: (field: FormItem) => void): void {
  for (const field of fields) {
    visit(field)
    if ('kind' in field && field.kind === 'group') {
      walkNestedFormItems(field.fields, visit)
    }
    if ('kind' in field && field.kind === 'dependent') {
      visit(field.controller)
      walkNestedFormItems(field.dependents.fields, visit)
    }
  }
}

function findArrayField(fields: FormItem[], name: string): ArrayConfig | undefined {
  let found: ArrayConfig | undefined
  walkNestedFormItems(fields, (field) => {
    if (!found && 'kind' in field && field.kind === 'array' && field.name === name) {
      found = field
    }
  })
  return found
}

function findRow(fields: GroupConfig['fields']): RowConfig | undefined {
  return fields.find((field): field is RowConfig => 'kind' in field && field.kind === 'row')
}

function collectFieldNames(fields: FormItem[]): string[] {
  const names: string[] = []
  for (const field of fields) {
    if ('name' in field) {
      names.push(field.name)
    } else if ('kind' in field && field.kind === 'row') {
      names.push(...collectFieldNames(field.fields))
    } else if ('kind' in field && field.kind === 'group') {
      names.push(...collectFieldNames(field.fields))
    } else if ('kind' in field && field.kind === 'dependent') {
      names.push(field.controller.name)
      names.push(...collectFieldNames(field.dependents.fields))
    }
  }
  return names
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

  const fireballWithArea = {
    ...SRD_SPELLS[0]!,
    slug: 'fireball',
    name: 'Fireball',
    level: 3,
    range: { kind: 'distance' as const, value: { value: 150, unit: 'ft' as const } },
    areaOfEffect: { shape: 'sphere' as const, radius: { value: 20, unit: 'ft' as const } },
  }

  it('preserves areaOfEffect through form round-trip', () => {
    const formValues = spellFormDef.toFormValues(fireballWithArea) as SpellFormValues
    const input = spellFormDef.toInput(formValues)
    expect(input.areaOfEffect).toEqual(fireballWithArea.areaOfEffect)
  })

  it('omits areaOfEffect when shape is none', () => {
    const formValues = spellFormDef.toFormValues(fireballWithArea) as SpellFormValues
    formValues.areaOfEffect = { shape: 'none' }
    const input = spellFormDef.toInput(formValues)
    expect(input.areaOfEffect).toBeUndefined()
  })
})

describe('spellFormDef area of effect fields', () => {
  it('includes shape select and conditional distance fields in the casting tab', () => {
    const castingTab = spellFormDef.buildTabs!({}).find((tab) => tab.id === 'casting')
    const areaGroup = findGroup(castingTab?.fields ?? [], 'Area of effect')
    expect(areaGroup?.kind).toBe('group')

    expect(collectFieldNames(areaGroup?.fields ?? [])).toEqual(
      expect.arrayContaining([
        'areaOfEffect.shape',
        'areaOfEffect.radius',
        'areaOfEffect.length',
        'areaOfEffect.width',
        'areaOfEffect.size',
        'areaOfEffect.height',
        'areaOfEffect.description',
      ]),
    )
  })

  it('lays out shape and radius in an auto-width row with the shape hint below the control', () => {
    const castingTab = spellFormDef.buildTabs!({}).find((tab) => tab.id === 'casting')
    const areaGroup = findGroup(castingTab?.fields ?? [], 'Area of effect')
    const row = findRow(areaGroup?.fields ?? [])

    expect(row?.kind).toBe('row')
    expect(row?.fields).toEqual([
      expect.objectContaining({
        type: 'select',
        name: 'areaOfEffect.shape',
        width: 'auto',
        hint: {
          text: 'Optional structured area geometry. Origin and movement are not modeled yet.',
          position: 'below-control',
        },
      }),
      expect.objectContaining({
        type: 'inputSelect',
        name: 'areaOfEffect.radius',
        width: 'auto',
      }),
    ])
  })
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

describe('spellFormDef resolution tab', () => {
  it('includes preview slot, empty state, and resolution sections', () => {
    const resolutionTab = spellFormDef.buildTabs!({}).find((tab) => tab.id === 'resolution')
    expect(resolutionTab).toBeDefined()
    expect(resolutionTab?.label).toBe('Resolution')

    const names = collectFieldNames(resolutionTab?.fields ?? [])
    expect(names).not.toContain('_resolutionPersistenceNotice')
    expect(names).toContain('_resolutionPreview')
    expect(names).toContain('_resolutionEmptyState')
    expect(names).toContain('_resolutionSelectionModeSelect')
    expect(names).toContain('_resolutionProximitySelect')
    expect(names).toContain('resolution.proximityReachDistanceFt')
    expect(names).toContain('_resolutionHowItResolves')
    expect(names).toContain('resolution.effects')
    expect(names).toContain('_resolutionEffectsApplicationLabel')
    expect(names).toContain('_resolutionOutcomes')
    expect(findGroup(resolutionTab?.fields ?? [], 'Selection')).toBeDefined()
    expect(findGroup(resolutionTab?.fields ?? [], 'How it resolves')).toBeDefined()
    expect(findGroup(resolutionTab?.fields ?? [], 'Effects & outcomes')).toBeDefined()
    expect(findGroup(resolutionTab?.fields ?? [], 'Authored effects')).toBeDefined()
    const effectsArray = findArrayField(resolutionTab?.fields ?? [], 'resolution.effects')
    expect(effectsArray).toBeDefined()
    expect(effectsArray?.legend).toBe('')
    expect(effectsArray?.item?.variant).toBe('detailed')
    expect(effectsArray?.item?.collapsible).toBe(true)
    expect(effectsArray?.item?.header?.primary).toBeTypeOf('function')
    expect(effectsArray?.item?.header?.summary).toBeTypeOf('function')
    expect(findGroup(resolutionTab?.fields ?? [], 'Outcome branches')).toMatchObject({
      description: RESOLUTION_SECTION_LABELS.outcomesHint,
    })
  })
})

describe('spellFormDef resolution integration', () => {
  const spellWithResolution: Spell = {
    ...SRD_SPELLS[0]!,
    resolution: ELDRITCH_BLAST_RESOLUTION,
    modeling: {
      reviewedAt: '2026-07-15T00:00:00.000Z',
      status: 'meaningful-partial',
    },
  }

  it('createDefaultValues omits resolution', () => {
    expect(spellFormDef.createDefaultValues).not.toHaveProperty('resolution')
  })

  it('spellFormSchema accepts optional resolution', () => {
    const parsed = spellFormSchema.parse({
      ...spellFormDef.createDefaultValues,
      name: 'Test',
      school: 'evocation',
      level: 0,
      classIds: ['wizard'],
      resolution: RESOLUTION_FORM_FIXTURES.eldritchBlast,
    })
    expect(parsed.resolution).toEqual(RESOLUTION_FORM_FIXTURES.eldritchBlast)
  })

  it('toFormValues hydrates resolution from the read model', () => {
    const formValues = spellFormDef.toFormValues(spellWithResolution) as SpellFormValues
    expect(formValues.resolution).toEqual(RESOLUTION_FORM_FIXTURES.eldritchBlast)
  })

  it('toInput maps resolution for persistence', () => {
    const formValues = spellFormDef.toFormValues(spellWithResolution) as SpellFormValues
    expect(formValues.resolution).toBeDefined()

    const input = spellFormDef.toInput(formValues)
    expect(input.resolution).toEqual(ELDRITCH_BLAST_RESOLUTION)
    expect(() => createSpellInputSchema.parse(input)).not.toThrow()
  })
})

describe('spellFormDef create vs update modes', () => {
  it('create: derives slug from name when slug is omitted', () => {
    const formValues = {
      ...spellFormDef.createDefaultValues,
      name: 'Custom Bolt',
      school: 'evocation',
      level: 1,
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

  it('update: sends null when a stored resolution is cleared in the form', () => {
    const spellWithResolution: Spell = {
      ...SRD_SPELLS[0]!,
      resolution: ELDRITCH_BLAST_RESOLUTION,
      modeling: {
        reviewedAt: '2026-07-15T00:00:00.000Z',
        status: 'meaningful-partial',
      },
    }
    const formValues = spellFormDef.toFormValues(spellWithResolution) as SpellFormValues
    delete formValues.resolution

    const input = spellFormDef.toInput(formValues, { entity: spellWithResolution })
    expect(input.resolution).toBeNull()
  })
})
