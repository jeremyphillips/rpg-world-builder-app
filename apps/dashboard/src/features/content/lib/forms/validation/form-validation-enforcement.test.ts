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

/** Minimal source snippets that must trip each legacy rule regex (§6 representative bypass). */
const FORM_VALIDATION_BYPASS_FIXTURES: Record<string, string> = {
  useSubmitHandler: 'export function x() { return useSubmitHandler() }',
  applyValidationIssuesToForm: 'applyValidationIssuesToForm(issues, form)',
  paintValidationIssuesOnForm: 'paintValidationIssuesOnForm(issues, form)',
  applyContentPublishValidation: 'applyContentPublishValidation(result)',
  prepareFormIssues: 'const routed = prepareFormIssues(errors, fields)',
  useFormValidationPresentation: 'const p = useFormValidationPresentation()',
  useAdoptedFormSubmit: 'const x = useAdoptedFormSubmit(fn, msg)',
}

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

  it('detects representative legacy bypass patterns for every enforcement rule', () => {
    expect(Object.keys(FORM_VALIDATION_BYPASS_FIXTURES).sort()).toEqual(
      FORM_VALIDATION_LEGACY_RULES.map((rule) => rule.id).sort(),
    )
    for (const rule of FORM_VALIDATION_LEGACY_RULES) {
      const fixture = FORM_VALIDATION_BYPASS_FIXTURES[rule.id]
      expect(fixture, rule.id).toBeDefined()
      expect(rule.pattern.test(fixture!), rule.id).toBe(true)
    }
  })

  it('documents deferred quick-npc on the adoption allowlist until phase 8', () => {
    expect(FORM_VALIDATION_ADOPTION_ALLOWLIST.map((e) => e.family)).toEqual(['quick-npc'])
    for (const path of FORM_VALIDATION_ENFORCEMENT_ROOTS) {
      expect(existsSync(join(repoRoot, path))).toBe(true)
    }
  })
})
