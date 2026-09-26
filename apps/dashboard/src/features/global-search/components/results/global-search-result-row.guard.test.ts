import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const rowSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'global-search-result-row.tsx'),
  'utf8',
)

describe('SearchResultRow passive identity guard', () => {
  it('does not pass interactive entity anatomy slots', () => {
    expect(rowSource).not.toMatch(/headingHref=/)
    expect(rowSource).not.toMatch(/\bleading=/)
    expect(rowSource).not.toMatch(/\btrailing=/)
    expect(rowSource).not.toMatch(/inlineAction/)
    expect(rowSource).not.toMatch(/\bdetails=/)
  })
})
