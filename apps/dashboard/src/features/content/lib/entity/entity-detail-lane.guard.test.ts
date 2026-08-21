import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(__dirname, '../../../../../../..')

const DETAIL_LANE_FILES = [
  'apps/dashboard/src/features/content/lib/detail/row/detail-entity-row.client.tsx',
  'apps/dashboard/src/features/content/lib/entity/surfaces/drawer/drawer-entity-block.client.tsx',
] as const

describe('entity detail lane migration guard', () => {
  it('does not compose ContentCardHeading directly in DER or drawer context paths', () => {
    for (const relativePath of DETAIL_LANE_FILES) {
      const source = readFileSync(join(REPO_ROOT, relativePath), 'utf8')
      expect(source, `${relativePath} must not import ContentCardHeading`).not.toMatch(
        /ContentCardHeading/,
      )
      expect(source, `${relativePath} must compose EntityAnatomyHost`).toMatch(/EntityAnatomy/)
    }
  })
})
