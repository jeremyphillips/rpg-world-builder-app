import { describe, expect, it } from 'vitest'

import type { FieldConfig } from '../field-config'
import { buildFieldRendererIds, resolveFieldRenderConfig } from './field-renderer-config.lib'

describe('field-renderer-config.lib', () => {
  it('builds nested array item ids from the dotted name prefix', () => {
    expect(
      buildFieldRendererIds({ type: 'text', name: 'label', label: 'Label' }, 'form', 'traits.0'),
    ).toEqual({
      fullName: 'traits.0.label',
      id: 'form-traits-0-label',
    })
  })

  it('inherits section density onto control size', () => {
    const config = {
      type: 'text',
      name: 'title',
      label: 'Title',
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'comfortable', {}, {}).controlSize).toBe('md')
    expect(resolveFieldRenderConfig(config, 'compact', {}, {}).controlSize).toBe('sm')
  })

  it('prefers controlSizeOverride over inherited density', () => {
    const config = {
      type: 'text',
      name: 'title',
      label: 'Title',
      controlSizeOverride: 'lg',
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'compact', {}, {}).controlSize).toBe('lg')
  })

  it('resolves derived metadata from watched values', () => {
    const config = {
      type: 'combobox',
      name: 'classification.facilityType',
      label: 'Facility type',
      options: [],
      derivedMeta: {
        reserveSpace: true,
        dependsOn: ['classification.facilityType'],
        metaWhen: (values) =>
          values['classification.facilityType']
            ? { rows: [{ label: 'Typical uses', value: 'Care' }] }
            : undefined,
      },
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'comfortable', {}, {})).toMatchObject({
      derivedMeta: undefined,
      derivedMetaReserveSpace: true,
    })
    expect(
      resolveFieldRenderConfig(
        config,
        'comfortable',
        { 'classification.facilityType': 'hospital' },
        {},
      ),
    ).toMatchObject({
      derivedMeta: { rows: [{ label: 'Typical uses', value: 'Care' }] },
    })
  })

  it('resolves dynamic select options from watched values', () => {
    const config = {
      type: 'select',
      name: 'classification.functionOverride',
      label: 'Function override',
      optionsResolve: {
        dependsOn: ['classification.facilityType'],
        optionsWhen: (values: Record<string, unknown>) =>
          values['classification.facilityType'] === 'hospital'
            ? [{ value: 'lodging', label: 'Lodging' }]
            : [{ value: 'care', label: 'Care' }],
      },
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'comfortable', {}, {}).config).toMatchObject({
      options: [{ value: 'care', label: 'Care' }],
    })
    expect(
      resolveFieldRenderConfig(
        config,
        'comfortable',
        { 'classification.facilityType': 'hospital' },
        {},
      ).config,
    ).toMatchObject({
      options: [{ value: 'lodging', label: 'Lodging' }],
    })
  })
})
