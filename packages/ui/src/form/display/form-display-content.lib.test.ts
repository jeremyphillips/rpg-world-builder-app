import { describe, expect, it } from 'vitest'

import {
  displayContentIsEmpty,
  normalizeDisplayBlocks,
  resolveDisplayBlocks,
} from './form-display-content.lib'
import type { DisplayConfig } from '../field-config'

describe('form-display-content.lib', () => {
  it('filters empty text blocks', () => {
    const config: DisplayConfig = {
      kind: 'display',
      id: 'empty-text',
      content: { variant: 'text', text: '   ' },
    }
    expect(displayContentIsEmpty(resolveDisplayBlocks(config, {}))).toBe(true)
  })

  it('resolves content from contentWhen', () => {
    const config: DisplayConfig = {
      kind: 'display',
      id: 'tier-summary',
      resolve: {
        dependsOn: ['level'],
        contentWhen: (values) =>
          typeof values.level === 'number'
            ? { variant: 'text', text: `Level ${values.level}`, role: 'muted' }
            : undefined,
      },
    }
    expect(resolveDisplayBlocks(config, { level: 5 })).toEqual([
      { variant: 'text', text: 'Level 5', role: 'muted' },
    ])
  })

  it('normalizes block arrays', () => {
    const blocks = normalizeDisplayBlocks([
      { variant: 'text', text: 'a' },
      { variant: 'text', text: 'b' },
    ])
    expect(blocks).toHaveLength(2)
  })
})
