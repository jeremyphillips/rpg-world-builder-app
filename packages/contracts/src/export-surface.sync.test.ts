import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'vitest'

import * as contentExports from './rpg/content/index'
import * as rootExports from './index'

function exportNames(moduleExports: Record<string, unknown>): string[] {
  return Object.keys(moduleExports)
    .filter((name) => name !== 'default')
    .sort()
}

describe('export surface snapshot sync', () => {
  it('writes export-surface.snapshot.json when EXPORT_SURFACE_WRITE=1', () => {
    if (process.env.EXPORT_SURFACE_WRITE !== '1') return

    const snapshot = {
      root: exportNames(rootExports),
      content: exportNames(contentExports),
    }

    fs.writeFileSync(
      path.join(import.meta.dirname, 'export-surface.snapshot.json'),
      `${JSON.stringify(snapshot, null, 2)}\n`,
    )
  })
})
