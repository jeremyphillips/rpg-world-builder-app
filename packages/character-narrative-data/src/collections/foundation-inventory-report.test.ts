import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { foundationCollection } from './foundation'
import { renderFoundationInventoryReport } from './foundation-inventory-report.lib'

describe('foundation inventory report', () => {
  it('matches the committed generated inventory', async () => {
    const reportPath = fileURLToPath(
      new URL('../../docs/foundation-inventory.generated.md', import.meta.url),
    )
    const committed = await readFile(reportPath, 'utf8')
    const rendered = renderFoundationInventoryReport(foundationCollection)
    expect(`${rendered.trimEnd()}\n`).toBe(`${committed.trimEnd()}\n`)
  })
})
