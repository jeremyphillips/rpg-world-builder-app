import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'

const repoRoot = join(process.cwd(), '../..')
const publishLibPath = join(
  repoRoot,
  'apps/dashboard/src/features/content/lib/forms/validation/content-publish-validation.lib.ts',
)

describe('form validation phase 8 exit', () => {
  it('cleared the adoption allowlist', () => {
    expect(FORM_VALIDATION_ADOPTION_ALLOWLIST).toEqual([])
  })

  it('retired legacy dashboard paint and surface helpers', () => {
    const source = readFileSync(publishLibPath, 'utf8')
    expect(source).not.toContain('applyValidationIssuesToForm')
    expect(source).not.toContain('paintValidationIssuesOnForm')
    expect(source).not.toContain('surfaceContentDraftPublishValidation')
  })
})
