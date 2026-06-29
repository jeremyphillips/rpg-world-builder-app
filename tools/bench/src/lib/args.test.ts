import { describe, expect, it } from 'vitest'

import { parseGlobalArgs } from './args'

describe('parseGlobalArgs', () => {
  it('extracts format and help without consuming command flags', () => {
    const { flags, positionals } = parseGlobalArgs([
      'add-ticket',
      '--json',
      '{"title":"Test"}',
      '--format',
      'text',
    ])

    expect(flags.format).toBe('text')
    expect(positionals).toEqual(['add-ticket', '--json', '{"title":"Test"}'])
  })

  it('passes list filter flags through to the command', () => {
    const { positionals } = parseGlobalArgs([
      'list-tickets',
      '--status',
      'backlog',
      '--priority',
      'high',
    ])

    expect(positionals).toEqual(['list-tickets', '--status', 'backlog', '--priority', 'high'])
  })
})
