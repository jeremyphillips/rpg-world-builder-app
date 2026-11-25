import { describe, expect, it } from 'vitest'

import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'
import {
  FORM_VALIDATION_ENFORCEMENT_ROOTS,
  FORM_VALIDATION_LEGACY_RULES,
  FORM_VALIDATION_RULE_EXEMPT_FILES,
} from './form-validation-enforcement.lib'

describe('form validation phase 7 exit', () => {
  it('promotes repository-wide scanner roots and legacy rules', () => {
    expect(FORM_VALIDATION_ENFORCEMENT_ROOTS.length).toBeGreaterThanOrEqual(3)
    expect(FORM_VALIDATION_LEGACY_RULES.map((rule) => rule.id)).toContain(
      'paintValidationIssuesOnForm',
    )
    expect(FORM_VALIDATION_RULE_EXEMPT_FILES.size).toBeGreaterThanOrEqual(5)
  })

  it('expects allowlist clearance in phase 8', () => {
    expect(FORM_VALIDATION_ADOPTION_ALLOWLIST.length).toBe(0)
  })
})
