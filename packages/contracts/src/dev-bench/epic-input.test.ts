import { describe, expect, it } from 'vitest'

import { createEpicInputSchema, updateEpicInputSchema } from './epic-input'

describe('createEpicInputSchema', () => {
  it('applies create defaults', () => {
    expect(
      createEpicInputSchema.parse({
        title: 'Character Builder',
      }),
    ).toStrictEqual({
      title: 'Character Builder',
      status: 'active',
    })
  })
})

describe('updateEpicInputSchema', () => {
  it('accepts an empty patch', () => {
    expect(updateEpicInputSchema.safeParse({}).success).toBe(true)
  })

  it('does not inject create defaults', () => {
    expect(updateEpicInputSchema.parse({})).toStrictEqual({})
  })
})
