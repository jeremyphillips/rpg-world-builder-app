import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { SOURCE_DOCUMENT_ENTRIES } from './source-document-registry'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')

describe('NOTICE parity (regression guard)', () => {
  it('includes the registry attribution statement for SRD 5.2.1', () => {
    const notice = fs.readFileSync(path.join(repoRoot, 'NOTICE'), 'utf8')
    const statement = SOURCE_DOCUMENT_ENTRIES['srd-5.2.1'].attributionStatement
    expect(notice).toContain('System Reference Document 5.2.1')
    expect(notice).toContain('https://www.dndbeyond.com/srd')
    expect(notice).toContain('creativecommons.org/licenses/by/4.0')
    expect(statement).toContain('System Reference Document 5.2.1')
  })
})
