import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { SOURCE_DOCUMENT_ENTRIES } from './source-document-registry'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

describe('NOTICE parity (regression guard)', () => {
  it('includes the registry attribution statement for SRD 5.2.1', () => {
    const notice = fs.readFileSync(path.join(repoRoot, 'NOTICE'), 'utf8')
    const statement = SOURCE_DOCUMENT_ENTRIES['srd-5.2.1'].attributionStatement
    expect(normalizeWhitespace(notice)).toContain(normalizeWhitespace(statement))
  })
})
