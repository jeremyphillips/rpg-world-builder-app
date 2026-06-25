import { describe, expect, it } from 'vitest'

import { contentChoiceSchema } from './choice'

describe('contentChoiceSchema', () => {
  it('accepts a pick-one option set with default choose count', () => {
    const result = contentChoiceSchema.parse({
      options: [
        { id: 'standard', label: 'Standard Equipment' },
        { id: 'gold', label: 'Starting Gold' },
      ],
    })

    expect(result.choose).toBe(1)
    expect(result.options).toHaveLength(2)
  })

  it('accepts an explicit choose count for multi-select pools', () => {
    expect(
      contentChoiceSchema.parse({
        choose: 2,
        options: [
          { id: 'a', label: 'Option A' },
          { id: 'b', label: 'Option B' },
          { id: 'c', label: 'Option C' },
        ],
      }).choose,
    ).toBe(2)
  })

  it('requires at least one option', () => {
    expect(contentChoiceSchema.safeParse({ options: [] }).success).toBe(false)
  })
})
