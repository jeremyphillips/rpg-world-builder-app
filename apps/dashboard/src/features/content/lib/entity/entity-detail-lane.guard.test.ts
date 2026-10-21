import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')

const DETAIL_LANE_FILES = [
  'apps/dashboard/src/features/content/lib/detail/row/entity/detail-entity-row.tsx',
  'apps/dashboard/src/features/content/lib/entity/surfaces/drawer/drawer-entity-block.tsx',
] as const

describe('entity detail lane migration guard', () => {
  it('composes EntityAnatomy in DER and drawer context paths', () => {
    for (const relativePath of DETAIL_LANE_FILES) {
      const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')
      expect(source, `${relativePath} must compose EntityAnatomy`).toMatch(/EntityAnatomy/)
    }
  })
})
