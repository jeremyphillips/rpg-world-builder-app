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

    expect(resolveFieldRenderConfig(config, 'md', {}, {}).size).toBe('md')
  })
})
