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

  it('inherits section size onto the render config', () => {
    const config = {
      type: 'text',
      name: 'title',
      label: 'Title',
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'md', {}, {}).config.size).toBe('md')
  })

  it('resolves derived metadata from watched values', () => {
    const config = {
      type: 'combobox',
      name: 'classification.archetype',
      label: 'Archetype',
      options: [],
      derivedMeta: {
        reserveSpace: true,
        dependsOn: ['classification.archetype'],
        metaWhen: (values) =>
          values['classification.archetype']
            ? { rows: [{ label: 'Typical uses', value: 'Care' }] }
            : undefined,
      },
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'md', {}, {})).toMatchObject({
      derivedMeta: undefined,
      derivedMetaReserveSpace: true,
    })
    expect(
      resolveFieldRenderConfig(config, 'md', { 'classification.archetype': 'almshouse' }, {}),
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
        dependsOn: ['classification.archetype'],
        optionsWhen: (values: Record<string, unknown>) =>
          values['classification.archetype'] === 'almshouse'
            ? [{ value: 'lodging', label: 'Lodging' }]
            : [{ value: 'care', label: 'Care' }],
      },
    } satisfies FieldConfig

    expect(resolveFieldRenderConfig(config, 'md', {}, {}).config).toMatchObject({
      options: [{ value: 'care', label: 'Care' }],
    })
    expect(
      resolveFieldRenderConfig(config, 'md', { 'classification.archetype': 'almshouse' }, {})
        .config,
    ).toMatchObject({
      options: [{ value: 'lodging', label: 'Lodging' }],
    })
  })
})
