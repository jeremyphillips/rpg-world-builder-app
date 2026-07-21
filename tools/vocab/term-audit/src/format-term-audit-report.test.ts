import { describe, expect, it } from 'vitest'

import { formatTermAuditReport } from './format-term-audit-report'
import { resolveContentTypeTarget } from './resolve-term-target'
import type { TermAuditReport } from './types'

describe('formatTermAuditReport', () => {
  it('formats stable human output from JSON report data', () => {
    const report: TermAuditReport = {
      schemaVersion: 1,
      target: resolveContentTypeTarget('species'),
      variants: [{ form: 'label', value: 'Species' }],
      usages: [],
      skippedFiles: [],
      parseFailures: [],
      summary: { canonical: 0, replaceable: 0, contextual: 0, ignored: 0, unknown: 0 },
    }

    expect(formatTermAuditReport(report)).toContain('Term audit: species')
    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
  })
})
