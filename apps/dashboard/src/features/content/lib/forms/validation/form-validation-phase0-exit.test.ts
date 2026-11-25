import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = join(process.cwd(), '../..')

const PHASE_0_REGRESSION_FIXTURES = [
  'apps/dashboard/src/features/content/lib/forms/validation/content-form-validation.test.ts',
  'apps/dashboard/src/features/content/lib/forms/validation/form-validation-pilot-regression.test.ts',
] as const

describe('form validation phase 0 exit', () => {
  it('keeps catalog sweep and pilot regression fixtures at repo paths', () => {
    for (const relativePath of PHASE_0_REGRESSION_FIXTURES) {
      expect(existsSync(join(repoRoot, relativePath))).toBe(true)
    }
  })
})
