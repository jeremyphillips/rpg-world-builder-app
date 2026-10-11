import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CONTENT_TYPE_KEYS, CONTENT_TYPE_TERMS, getTermCollectionLabel } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'monster-form-labels.ts'),
  'utf8',
)

describe('monster-form-labels', () => {
  it('does not embed catalog nouns as string literals', () => {
    const owned = CONTENT_TYPE_KEYS.flatMap((key) => {
      const term = CONTENT_TYPE_TERMS[key]
      return [term.label, getTermCollectionLabel(term)]
    })
    const literals = [...source.matchAll(/'([^'\\]+)'|"([^"\\]+)"/g)].map(
      (match) => match[1] ?? match[2] ?? '',
    )
    for (const noun of owned) {
      expect(literals, noun).not.toContain(noun)
    }
  })
})
