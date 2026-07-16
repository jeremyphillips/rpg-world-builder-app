import { describe, expect, it } from 'vitest'

import { NameGeneratorError } from '@rpg/contracts/name-generator'

import { assembleName } from './assemble-name'

describe('assembleName', () => {
  it('interpolates format tokens', () => {
    const value = assembleName(
      {
        id: 'full',
        label: 'Full',
        parts: [
          { key: 'given', role: 'given' },
          { key: 'family', role: 'family' },
        ],
        format: '{given} {family}',
      },
      { given: 'Aelar', family: 'Amastacia' },
    )

    expect(value).toBe('Aelar Amastacia')
  })

  it('throws when a required part is missing', () => {
    expect(() =>
      assembleName(
        {
          id: 'full',
          label: 'Full',
          parts: [
            { key: 'given', role: 'given' },
            { key: 'family', role: 'family' },
          ],
          format: '{given} {family}',
        },
        { given: 'Aelar' },
      ),
    ).toThrow(NameGeneratorError)
  })
})
