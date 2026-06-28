import { describe, expect, it } from 'vitest'

import { parseAcceptanceCriteria } from './parse-acceptance-criteria'

describe('parseAcceptanceCriteria', () => {
  it('parses markdown bullets', () => {
    expect(parseAcceptanceCriteria('- First item\n* Second item')).toEqual([
      'First item',
      'Second item',
    ])
  })

  it('parses numbered lists', () => {
    expect(parseAcceptanceCriteria('1. One\n2) Two\n3. Three')).toEqual(['One', 'Two', 'Three'])
  })

  it('drops blank lines and trims whitespace', () => {
    expect(parseAcceptanceCriteria('  -  spaced  \n\n\t* another  ')).toEqual(['spaced', 'another'])
  })

  it('returns empty array for empty input', () => {
    expect(parseAcceptanceCriteria('')).toEqual([])
    expect(parseAcceptanceCriteria('\n\n')).toEqual([])
  })
})
