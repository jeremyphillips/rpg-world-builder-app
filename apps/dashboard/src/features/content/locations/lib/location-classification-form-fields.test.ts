import { describe, expect, it } from 'vitest'

import {
  buildBuildingArchetypeFieldOptions,
  BUILDING_FUNCTION_OVERRIDE_HINT,
  formatBuildingArchetypeOptionDescription,
  resolveBuildingArchetypeDerivedMeta,
} from './building-archetype-form-options'
import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
} from './location-classification-form-fields'

type FormItemLike = ReturnType<typeof buildLocationClassificationFields>[number]

function fieldByName(items: FormItemLike[], name: string) {
  const field = items.find((item) => !('kind' in item) && item.name === name)
  if (!field) {
    throw new Error(`expected field ${name}`)
  }
  return field
}

describe('building archetype form options', () => {
  it('includes manifestation context in option descriptions', () => {
    expect(formatBuildingArchetypeOptionDescription('caravanserai')).toBe(
      'Inn manifestation · Lodging · Retail',
    )
    expect(formatBuildingArchetypeOptionDescription('inn')).toBe('Lodging · Food & drink')
  })

  it('builds combobox options from the registry', () => {
    const caravanserai = buildBuildingArchetypeFieldOptions().find(
      (option) => option.value === 'caravanserai',
    )
    expect(caravanserai).toMatchObject({
      label: 'Caravanserai',
      description: 'Inn manifestation · Lodging · Retail',
    })
  })

  it('returns undefined derived metadata when no archetype is selected', () => {
    expect(resolveBuildingArchetypeDerivedMeta({})).toBeUndefined()
  })

  it('resolves typical uses as separate label and value rows', () => {
    expect(resolveBuildingArchetypeDerivedMeta({ 'classification.archetype': 'inn' })).toEqual({
      rows: [{ label: 'Typical uses', value: 'Lodging · Food & drink' }],
    })
    expect(
      resolveBuildingArchetypeDerivedMeta({ 'classification.archetype': 'guildhall' }),
    ).toEqual({
      rows: [{ label: 'Typical uses', value: 'Assembly · Governance' }],
    })
  })

  it('resolves caravanserai typical uses from the registry without a related archetype row', () => {
    expect(
      resolveBuildingArchetypeDerivedMeta({ 'classification.archetype': 'caravanserai' }),
    ).toEqual({
      rows: [{ label: 'Typical uses', value: 'Lodging · Retail' }],
    })
  })

  it('updates derived metadata when the selected archetype changes', () => {
    expect(
      resolveBuildingArchetypeDerivedMeta({ 'classification.archetype': 'inn' })?.rows[0],
    ).toMatchObject({ value: 'Lodging · Food & drink' })
    expect(
      resolveBuildingArchetypeDerivedMeta({ 'classification.archetype': 'guildhall' })?.rows[0],
    ).toMatchObject({ value: 'Assembly · Governance' })
  })
})

describe('buildLocationClassificationFields building UX', () => {
  it('keeps secondary fields after the primary classification row', () => {
    const primaryNames = buildLocationPrimaryClassificationFields().flatMap((item) => {
      if ('kind' in item) return []
      return [item.name]
    })
    const secondaryNames = buildLocationClassificationFields().flatMap((item) => {
      if ('kind' in item) {
        return []
      }
      return [item.name]
    })

    expect(primaryNames).toEqual([
      'planeType',
      'classification.kind',
      'settlementType',
      'siteType',
      'classification.archetype',
      'interiorType',
    ])
    expect(secondaryNames).toEqual([
      'classification.type',
      'classification.specialization',
      'classification.functionOverride',
      'classification.type',
    ])
  })

  it('wires the archetype combobox with derived metadata instead of a dynamic hint', () => {
    const archetypeField = fieldByName(
      buildLocationPrimaryClassificationFields(),
      'classification.archetype',
    )
    expect(archetypeField).toMatchObject({
      type: 'combobox',
      multiple: false,
      placeholder: 'Search building archetypes…',
      visibility: {
        dependsOn: ['authoringType'],
      },
      derivedMeta: {
        reserveSpace: true,
        dependsOn: ['classification.archetype'],
      },
    })
    expect(archetypeField).not.toHaveProperty('hint')
  })

  it('wires specialization as text-with-suggestions driven by archetype', () => {
    const specializationField = fieldByName(
      buildLocationClassificationFields(),
      'classification.specialization',
    )
    expect(specializationField).toMatchObject({
      type: 'textSuggestions',
      placeholder: 'Optional',
      visibility: {
        dependsOn: ['authoringType'],
      },
      suggestions: {
        dependsOn: ['classification.archetype'],
      },
    })
  })

  it('wires function override with static guidance and no dynamic default-function hint', () => {
    const overrideField = fieldByName(
      buildLocationClassificationFields(),
      'classification.functionOverride',
    )
    expect(overrideField).toMatchObject({
      type: 'select',
      placeholder: 'Use archetype defaults',
      hint: BUILDING_FUNCTION_OVERRIDE_HINT,
      visibility: {
        dependsOn: ['authoringType'],
      },
      optionalDisclosure: {
        addLabel: 'Add function override',
        removeLabel: 'Remove function override',
      },
    })
    expect(overrideField).not.toHaveProperty('hint.resolve')
    expect(BUILDING_FUNCTION_OVERRIDE_HINT).not.toMatch(/Default functions:/)
  })
})
