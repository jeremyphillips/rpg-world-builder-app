import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'
import {
  FORM_VALIDATION_ENFORCEMENT_ROOTS,
  FORM_VALIDATION_LEGACY_RULES,
  scanFormValidationEnforcement,
} from './form-validation-enforcement.lib'

const repoRoot = join(process.cwd(), '../..')

describe('form validation enforcement', () => {
  it('scans adopted dashboard and public auth scopes without legacy bypasses', () => {
    const { violations } = scanFormValidationEnforcement(repoRoot)
    expect(violations, violations.map((v) => `${v.file}: ${v.ruleId}`).join('\n')).toEqual([])
  })

  it('covers content, campaign, quick npc, and public auth enforcement roots', () => {
    expect(FORM_VALIDATION_ENFORCEMENT_ROOTS).toEqual([
      'apps/dashboard/src/features/content',
      'apps/dashboard/src/features/campaign',
      'apps/dashboard/src/features/character/npc',
      'apps/public/src/features/auth',
    ])
  })

  it('detects representative legacy bypass patterns', () => {
    const sample = 'const x = useAdoptedFormSubmit(fn, msg)'
    for (const rule of FORM_VALIDATION_LEGACY_RULES) {
      expect(rule.pattern.test(sample), rule.id).toBe(rule.id === 'useAdoptedFormSubmit')
    }
  })

  it('documents deferred quick-npc on the adoption allowlist until phase 8', () => {
    expect(FORM_VALIDATION_ADOPTION_ALLOWLIST.map((e) => e.family)).toEqual(['quick-npc'])
    for (const path of FORM_VALIDATION_ENFORCEMENT_ROOTS) {
      expect(existsSync(join(repoRoot, path))).toBe(true)
    }
  })
})
