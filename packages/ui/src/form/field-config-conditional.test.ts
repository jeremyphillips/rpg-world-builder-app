import { describe, expect, it } from 'vitest'

import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  combineFieldVisibility,
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

describe('resolveFieldHint', () => {
  it('prefers dynamic hint when provided', () => {
    expect(
      resolveFieldHint(
        {
          hint: 'Static hint',
          dynamicHint: {
            dependsOn: ['mode'],
            hintWhen: (values) =>
              values.mode === 'ranged' ? 'Ranged hint' : undefined,
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
          hint: 'Static hint',
          dynamicHint: {
            dependsOn: ['mode'],
            hintWhen: () => undefined,
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
