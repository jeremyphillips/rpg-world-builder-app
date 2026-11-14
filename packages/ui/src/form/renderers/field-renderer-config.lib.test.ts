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

    const resolved = resolveFieldRenderConfig(config, { density: 'comfortable' }, {}, {})

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

    const resolved = resolveFieldRenderConfig(config, { density: 'comfortable' }, {}, {})

    expect(resolved.hint).toBe('Pick your two best stats.')
  })

  it('resolves text suggestion strings from watched values', () => {
    const config: FieldConfig = {
      type: 'textSuggestions',
      name: 'refinement',
      label: 'Refinement',
      suggestions: {
        dependsOn: ['driver'],
        suggestionsWhen: (values) => (values.driver === 'inn' ? ['coaching inn'] : []),
      },
    }

    expect(
      resolveFieldRenderConfig(config, { density: 'comfortable' }, { driver: 'inn' }, {})
        .resolvedSuggestions,
    ).toEqual(['coaching inn'])
  })
})
