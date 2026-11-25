import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'
import {
  FORM_VALIDATION_ENFORCEMENT_ROOTS,
  scanFormValidationEnforcement,
} from './form-validation-enforcement.lib'

const repoRoot = join(process.cwd(), '../..')

describe('form validation enforcement (phase 7)', () => {
  it('scans adopted dashboard and public auth scopes without legacy bypasses', () => {
    const { violations } = scanFormValidationEnforcement(repoRoot)
    expect(violations, violations.map((v) => `${v.file}: ${v.ruleId}`).join('\n')).toEqual([])
  })

  it('covers content, campaign, and public auth enforcement roots', () => {
    expect(FORM_VALIDATION_ENFORCEMENT_ROOTS).toEqual([
      'apps/dashboard/src/features/content',
      'apps/dashboard/src/features/campaign',
      'apps/public/src/features/auth',
    ])
  })

  it('defers only named workflows on the adoption allowlist', () => {
    for (const entry of FORM_VALIDATION_ADOPTION_ALLOWLIST) {
      expect(entry.removesIn.startsWith('phase-7-')).toBe(true)
      for (const path of entry.paths) {
        expect(existsSync(join(repoRoot, path))).toBe(true)
      }
    }
  })

  it('still records quick npc on legacy submit until its phase 7 milestone', () => {
    const quickNpcPath = join(
      repoRoot,
      'apps/dashboard/src/features/character/npc/components/quick-npc/quick-npc-authoring-form.tsx',
    )
    const source = readFileSync(quickNpcPath, 'utf8')
    expect(source).toContain('useSubmitHandler')
  })
})
