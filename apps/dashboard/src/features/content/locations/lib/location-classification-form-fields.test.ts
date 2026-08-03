import { describe, expect, it } from 'vitest'

import type { TextSuggestionsFieldConfig } from '@rpg/ui/form'

import {
  buildBuildingArchetypeFieldOptions,
  BUILDING_FUNCTION_OVERRIDE_HINT,
  formatBuildingArchetypeOptionDescription,
  hasBuildingFunctionOverrideChoices,
  isRedundantBuildingFunctionOverride,
  resolveBuildingArchetypeDerivedMeta,
  resolveBuildingFunctionOverrideFieldOptions,
} from './building-archetype-form-options'
import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
} from './location-classification-form-fields'

const BUILDING_SPECIALIZATION_HINT =
  'Add a specialization when you want to describe a more specific kind of building.'

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

describe('building function override options', () => {
  it('excludes all default functions for the selected archetype', () => {
    expect(
      resolveBuildingFunctionOverrideFieldOptions({ 'classification.archetype': 'almshouse' }).map(
        (option) => option.value,
      ),
    ).not.toContain('care')
  })

  it('excludes every default when an archetype has multiple functions', () => {
    const values = resolveBuildingFunctionOverrideFieldOptions({
      'classification.archetype': 'inn',
    }).map((option) => option.value)

    expect(values).not.toContain('lodging')
    expect(values).not.toContain('food_drink_social')
  })

  it('detects redundant overrides that repeat an archetype default', () => {
    expect(
      isRedundantBuildingFunctionOverride({
        'classification.archetype': 'almshouse',
        'classification.functionOverride': 'care',
      }),
    ).toBe(true)
    expect(
      isRedundantBuildingFunctionOverride({
        'classification.archetype': 'temple',
        'classification.functionOverride': 'lodging',
      }),
    ).toBe(false)
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
      width: '2/3',
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

  it('wires specialization as an optional text-suggestions field gated on building and archetype', () => {
    const specializationField = fieldByName(
      buildLocationClassificationFields(),
      'classification.specialization',
    ) as TextSuggestionsFieldConfig
    expect(specializationField).toMatchObject({
      type: 'textSuggestions',
      placeholder: 'Enter specialization…',
      hint: BUILDING_SPECIALIZATION_HINT,
      visibility: {
        dependsOn: ['authoringType', 'classification.archetype'],
      },
      suggestions: {
        dependsOn: ['classification.archetype'],
      },
      optionalDisclosure: {
        addLabel: 'Add specialization',
        removeLabel: 'Remove specialization',
      },
    })
    expect(specializationField.suggestions).not.toHaveProperty('headingWhen')
    expect(
      specializationField.visibility?.visibleWhen?.({
        authoringType: 'building',
        'classification.archetype': 'inn',
      }),
    ).toBe(true)
    expect(
      specializationField.visibility?.visibleWhen?.({
        authoringType: 'region',
        'classification.archetype': 'inn',
      }),
    ).toBe(false)
    expect(
      specializationField.visibility?.visibleWhen?.({
        authoringType: 'building',
        'classification.archetype': undefined,
      }),
    ).toBe(false)
  })

  it('wires function override with dynamic options and hides when no choices remain', () => {
    const overrideField = fieldByName(
      buildLocationClassificationFields(),
      'classification.functionOverride',
    )
    expect(overrideField).toMatchObject({
      type: 'select',
      placeholder: 'Select function…',
      hint: BUILDING_FUNCTION_OVERRIDE_HINT,
      optionsResolve: {
        dependsOn: ['classification.archetype'],
      },
      visibility: {
        dependsOn: ['authoringType', 'classification.archetype'],
      },
      optionalDisclosure: {
        addLabel: 'Add function override',
        removeLabel: 'Remove function override',
      },
    })
    expect(overrideField).not.toHaveProperty('hint.resolve')
    expect(
      resolveBuildingFunctionOverrideFieldOptions({ 'classification.archetype': 'almshouse' }),
    ).not.toEqual(expect.arrayContaining([expect.objectContaining({ value: 'care' })]))
    expect(
      hasBuildingFunctionOverrideChoices({
        authoringType: 'building',
        'classification.archetype': 'inn',
      }),
    ).toBe(true)
    expect(
      hasBuildingFunctionOverrideChoices({
        authoringType: 'building',
      }),
    ).toBe(false)
  })
})
