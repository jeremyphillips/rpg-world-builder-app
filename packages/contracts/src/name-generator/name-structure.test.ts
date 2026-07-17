import { describe, expect, it } from 'vitest'

import { expectParseFailure, expectParseSuccess } from '../test/helpers/expect-zod-result'
import { nameStructureDefinitionSchema } from './name-structure'

describe('nameStructureDefinitionSchema', () => {
  it('accepts a valid structure', () => {
    const result = nameStructureDefinitionSchema.safeParse({
      id: 'full',
      label: 'Full name',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'family', role: 'family', required: true },
      ],
      format: '{given} {family}',
    })

    expectParseSuccess(result)
  })

  it('rejects format tokens that do not match part keys', () => {
    const result = nameStructureDefinitionSchema.safeParse({
      id: 'bad',
      label: 'Bad',
      parts: [{ key: 'given', role: 'given' }],
      format: '{given} {family}',
    })

    expectParseFailure(result, { path: ['format'] })
  })

  it('rejects required parts missing from format', () => {
    const result = nameStructureDefinitionSchema.safeParse({
      id: 'bad',
      label: 'Bad',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'family', role: 'family', required: true },
      ],
      format: '{given}',
    })

    expectParseFailure(result, { path: ['parts'] })
  })
})

describe('extractFormatTokens', () => {
  it('parses repeated and adjacent tokens', async () => {
    const { extractFormatTokens } = await import('./name-structure')
    expect(extractFormatTokens('{placeRoot}{placeSuffix}')).toEqual(['placeRoot', 'placeSuffix'])
    expect(extractFormatTokens('The {descriptor} {organizationType}')).toEqual([
      'descriptor',
      'organizationType',
    ])
  })
})
