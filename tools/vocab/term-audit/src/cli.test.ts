import { describe, expect, it } from 'vitest'

import { parseCliArgs, runCli, TERM_AUDIT_EXIT_CODE } from './cli'

describe('term audit CLI', () => {
  it('parses target, format, compact, and repeated ignore options', () => {
    expect(
      parseCliArgs([
        '--content-type',
        'species',
        '--format',
        'json',
        '--include-compact',
        '--ignore',
        '**/*.stories.tsx',
        '--ignore',
        '**/*.test.ts',
      ]),
    ).toEqual({
      contentType: 'species',
      includeCompact: true,
      format: 'json',
      ignore: ['**/*.stories.tsx', '**/*.test.ts'],
      help: false,
    })
  })

  it('requires exactly one target', () => {
    expect(() => parseCliArgs([])).toThrow('Provide exactly one target')
    expect(() => parseCliArgs(['--term', 'species', '--vocab-set', 'creature-types'])).toThrow(
      'Provide exactly one target',
    )
    expect(TERM_AUDIT_EXIT_CODE.invalidTarget).toBe(2)
  })

  it('returns the invalid-target exit code for invalid command input', () => {
    expect(runCli([])).toBe(TERM_AUDIT_EXIT_CODE.invalidTarget)
  })
})
