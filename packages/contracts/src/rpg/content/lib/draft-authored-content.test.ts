import { describe, expect, it } from 'vitest'

import {
  draftAuthoredContentBodySchema,
  formatUntitledContentName,
  untitledContentName,
} from './draft-authored-content'

describe('draft authored content helpers', () => {
  it('formats untitled display names from the type label', () => {
    expect(formatUntitledContentName('Feat')).toBe('Untitled Feat')
    expect(untitledContentName('Skill Proficiency')).toBe('Untitled Skill Proficiency')
  })

  it('applies the untitled fallback when name is blank', () => {
    const schema = draftAuthoredContentBodySchema('Feat')
    expect(schema.parse({ name: '' }).name).toBe('Untitled Feat')
    expect(schema.parse({ name: '   ' }).name).toBe('Untitled Feat')
  })

  it('preserves a non-empty trimmed name', () => {
    const schema = draftAuthoredContentBodySchema('Feat')
    expect(schema.parse({ name: 'Custom Feat' }).name).toBe('Custom Feat')
  })
})
