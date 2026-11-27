import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTED_FAMILIES } from './form-validation-adopted-families'

const repoRoot = join(process.cwd(), '../..')

describe('form validation family adoption guard', () => {
  it('records production-entry regression anchors for each adopted family', () => {
    const anchors: Record<string, string> = {
      'content-hub':
        'apps/dashboard/src/features/content/lib/forms/shells/submit/content-form-submit-drift.test.ts',
      campaign:
        'apps/dashboard/src/features/campaign/lib/campaign-form-validation-adoption.test.ts',
      'public-auth': 'apps/public/src/features/auth/lib/auth-form-adoption.test.ts',
      'content-master-detail':
        'apps/dashboard/src/features/content/lib/forms/validation/content-form-tab-ownership.test.ts',
      'quick-npc':
        'apps/dashboard/src/features/content/lib/forms/validation/form-validation-adoption-allowlist.ts',
    }

    for (const family of FORM_VALIDATION_ADOPTED_FAMILIES) {
      const anchor = anchors[family.id]
      expect(anchor, `missing anchor for ${family.id}`).toBeTruthy()
      const source = readFileSync(join(repoRoot, anchor!), 'utf8')
      expect(source.length).toBeGreaterThan(0)
    }
  })
})
