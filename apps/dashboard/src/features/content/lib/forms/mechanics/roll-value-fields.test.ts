import { describe, expect, it } from 'vitest'

import { rollValueFields } from './roll-value-fields'

describe('rollValueFields', () => {
  it('binds dice count, faces, and flat directly to RollValue paths', () => {
    const fields = rollValueFields({ namePrefix: 'damage' })
    const inlineSentence = fields.find(
      (field) => !('kind' in field) && field.type === 'inlineSentence',
    )

    expect(inlineSentence).toMatchObject({
      name: 'damage',
      type: 'inlineSentence',
      segments: [
        expect.objectContaining({ kind: 'number', name: 'damage.dice.count' }),
        expect.objectContaining({ kind: 'text', value: 'd' }),
        expect.objectContaining({ kind: 'select', name: 'damage.dice.faces', digits: 2 }),
      ],
    })

    expect(
      fields.find((field) => !('kind' in field) && field.name === 'damage.flat'),
    ).toMatchObject({
      type: 'number',
      label: 'Flat modifier',
    })
  })
})
