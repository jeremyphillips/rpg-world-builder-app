import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  findBannedSemanticControlGeometry,
  MIGRATED_SEMANTIC_CONTROL_VARIANT_FILES,
} from './semantic-control-variants-geometry-ban.lib'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

describe('semantic control variants geometry ban', () => {
  it('registers every migrated control variant module', () => {
    expect(MIGRATED_SEMANTIC_CONTROL_VARIANT_FILES.length).toBeGreaterThanOrEqual(10)
  })

  it('forbids raw geometry utilities in migrated *.variants.ts modules', () => {
    const failures: string[] = []

    for (const relPath of MIGRATED_SEMANTIC_CONTROL_VARIANT_FILES) {
      const absolutePath = join(repoRoot, relPath)
      const violations = findBannedSemanticControlGeometry(readFileSync(absolutePath, 'utf8'))
      if (violations.length > 0) {
        failures.push(`${relPath}: ${violations.join(', ')}`)
      }
    }

    expect(failures).toEqual([])
  })
})
