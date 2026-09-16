import { describe, expect, it } from 'vitest'

import type { FieldConfig } from '../field-config'
import { resolveFieldRenderConfig } from './field-renderer-config.lib'

describe('resolveFieldRenderConfig', () => {
  it('derives constraint hints for multi-select chips when no explicit hint is set', () => {
    const config: FieldConfig = {
      type: 'chips',
      name: 'primaryAbilities',
      label: 'Primary abilities',
      options: [],
      max: 2,
      noun: {
        singular: 'primary ability',
        plural: 'primary abilities',
      },
    }

    const resolved = resolveFieldRenderConfig(config, 'comfortable', {}, {})

    expect(resolved.hint).toBe('Choose up to 2 primary abilities.')
  })

  it('prefers explicit hints over derived constraint copy', () => {
    const config: FieldConfig = {
      type: 'chips',
      name: 'primaryAbilities',
      label: 'Primary abilities',
      options: [],
      max: 2,
      hint: 'Pick your two best stats.',
    }

    const resolved = resolveFieldRenderConfig(config, 'comfortable', {}, {})

    expect(resolved.hint).toBe('Pick your two best stats.')
  })
})
