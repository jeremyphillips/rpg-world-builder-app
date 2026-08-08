import { describe, expect, it } from 'vitest'

import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  areVisibilityDependenciesKnown,
  combineFieldVisibility,
  combineFieldVisibilityAll,
  resolveFieldHint,
} from './field-config'

describe('combineFieldVisibility', () => {
  it('merges dependsOn and ORs visibleWhen predicates', () => {
    const combined = combineFieldVisibility(
      {
        dependsOn: ['mode'],
        visibleWhen: (values) => values.mode === 'ranged',
      },
      {
        dependsOn: ['properties'],
        visibleWhen: (values) =>
          Array.isArray(values.properties) && values.properties.includes('thrown'),
      },
    )

    expect(combined.dependsOn).toEqual(['mode', 'properties'])
    expect(combined.visibleWhen({ mode: 'melee', properties: ['thrown'] })).toBe(true)
    expect(combined.visibleWhen({ mode: 'ranged', properties: [] })).toBe(true)
    expect(combined.visibleWhen({ mode: 'melee', properties: ['finesse'] })).toBe(false)
  })
})

describe('areVisibilityDependenciesKnown', () => {
  it('returns false when visibility is missing', () => {
    expect(areVisibilityDependenciesKnown(undefined, ['authoringType'])).toBe(false)
  })

  it('returns false when dependsOn is missing', () => {
    expect(
      areVisibilityDependenciesKnown({ dependsOn: undefined as unknown as string[] }, [
        'authoringType',
      ]),
    ).toBe(false)
  })

  it('returns true when declared deps are a subset of known keys', () => {
    expect(
      areVisibilityDependenciesKnown({ dependsOn: ['authoringType'] }, ['authoringType', 'mode']),
    ).toBe(true)
  })

  it('returns true when declared deps exactly match known keys', () => {
    expect(
      areVisibilityDependenciesKnown({ dependsOn: ['authoringType'] }, ['authoringType']),
    ).toBe(true)
  })

  it('returns true for empty dependsOn', () => {
    expect(areVisibilityDependenciesKnown({ dependsOn: [] }, ['authoringType'])).toBe(true)
  })

  it('returns false when declared deps are not a subset of known keys', () => {
    expect(
      areVisibilityDependenciesKnown({ dependsOn: ['authoringType', 'foo'] }, ['authoringType']),
    ).toBe(false)
  })
})

describe('combineFieldVisibilityAll', () => {
  it('merges dependsOn and ANDs visibleWhen predicates', () => {
    const combined = combineFieldVisibilityAll(
      {
        dependsOn: ['grantType'],
        visibleWhen: (values) => values.grantType === 'equipment',
      },
      {
        dependsOn: ['itemKind'],
        visibleWhen: (values) => values.itemKind === 'choice',
      },
    )

    expect(combined.dependsOn).toEqual(['grantType', 'itemKind'])
    expect(combined.visibleWhen({ grantType: 'equipment', itemKind: 'choice' })).toBe(true)
    expect(combined.visibleWhen({ grantType: 'equipment', itemKind: 'grant' })).toBe(false)
    expect(combined.visibleWhen({ grantType: 'feat', itemKind: 'choice' })).toBe(false)
  })
})

describe('resolveFieldHint', () => {
  it('prefers dynamic hint when provided', () => {
    expect(
      resolveFieldHint(
        {
          hint: {
            text: 'Static hint',
            resolve: {
              dependsOn: ['mode'],
              hintWhen: (values: Record<string, unknown>) =>
                values.mode === 'ranged' ? 'Ranged hint' : undefined,
            },
          },
        },
        { mode: 'ranged' },
      ),
    ).toBe('Ranged hint')
  })

  it('falls back to static hint when dynamic hint is undefined', () => {
    expect(
      resolveFieldHint(
        {
          hint: {
            text: 'Static hint',
            resolve: {
              dependsOn: ['mode'],
              hintWhen: () => undefined,
            },
          },
        },
        { mode: 'melee' },
      ),
    ).toBe('Static hint')
  })
})

describe('applyOptionAvailabilityToFieldOptions', () => {
  const availability = {
    dependsOn: ['mode'],
    enabledWhen: (values: Record<string, unknown>, optionValue: string) =>
      values.mode !== 'ranged' || optionValue !== 'reach',
  }

  it('marks incompatible options disabled without removing selected values', () => {
    const options = applyOptionAvailabilityToFieldOptions(
      [
        { value: 'reach', label: 'Reach' },
        { value: 'finesse', label: 'Finesse' },
      ],
      availability,
      { mode: 'ranged' },
    )

    expect(options).toEqual([
      { value: 'reach', label: 'Reach', disabled: true },
      { value: 'finesse', label: 'Finesse', disabled: false },
    ])
  })
})

describe('applyOptionAvailabilityToSelectOptions', () => {
  it('applies availability inside option groups', () => {
    const options = applyOptionAvailabilityToSelectOptions(
      [
        {
          kind: 'group',
          label: 'Properties',
          options: [
            { value: 'reach', label: 'Reach' },
            { value: 'versatile', label: 'Versatile' },
          ],
        },
      ],
      {
        dependsOn: ['mode'],
        enabledWhen: (_values, optionValue) => optionValue !== 'reach',
      },
      { mode: 'ranged' },
    )

    expect(options).toEqual([
      {
        kind: 'group',
        label: 'Properties',
        options: [
          { value: 'reach', label: 'Reach', disabled: true },
          { value: 'versatile', label: 'Versatile', disabled: false },
        ],
      },
    ])
  })
})
