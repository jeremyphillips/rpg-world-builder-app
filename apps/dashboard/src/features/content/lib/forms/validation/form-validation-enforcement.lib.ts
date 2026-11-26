import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { FORM_VALIDATION_ADOPTION_ALLOWLIST } from './form-validation-adoption-allowlist'

export type FormValidationLegacyRule = {
  id: string
  pattern: RegExp
}

export const FORM_VALIDATION_LEGACY_RULES: readonly FormValidationLegacyRule[] = [
  { id: 'useSubmitHandler', pattern: /\buseSubmitHandler\b/ },
  { id: 'applyValidationIssuesToForm', pattern: /\bapplyValidationIssuesToForm\b/ },
  { id: 'paintValidationIssuesOnForm', pattern: /\bpaintValidationIssuesOnForm\b/ },
  { id: 'applyContentPublishValidation', pattern: /\bapplyContentPublishValidation\b/ },
  { id: 'prepareFormIssues', pattern: /\bprepareFormIssues\b/ },
  { id: 'useFormValidationPresentation', pattern: /\buseFormValidationPresentation\b/ },
] as const

/** Production scopes where adopted families must not add new validation bypasses. */
export const FORM_VALIDATION_ENFORCEMENT_ROOTS = [
  'apps/dashboard/src/features/content',
  'apps/dashboard/src/features/campaign',
  'apps/dashboard/src/features/character/npc',
  'apps/public/src/features/auth',
] as const

/** Intentional legacy islands documented in form-validation-lifecycle.md. */
export const FORM_VALIDATION_RULE_EXEMPT_FILES = new Set([
  'apps/dashboard/src/features/content/lib/forms/shells/submit/content-form-submit.ts',
  'apps/dashboard/src/features/content/lib/forms/validation/content-publish-validation.lib.ts',
  'apps/dashboard/src/features/content/lib/forms/validation/content-form-presentation-issues.client.ts',
  'apps/dashboard/src/features/content/lib/forms/validation/content-form-validation-rhf.lib.ts',
  'apps/dashboard/src/features/content/lib/forms/validation/content-draft-publish-validation-surface.client.tsx',
  'apps/dashboard/src/features/content/lib/forms/validation/form-validation-enforcement.lib.ts',
])

const TEST_FILE = /\.(test|stories)\.(t|j)sx?$/

function repoRootFromDashboard(): string {
  return join(process.cwd(), '../..')
}

function isAllowlisted(repoRelativePath: string): boolean {
  return FORM_VALIDATION_ADOPTION_ALLOWLIST.some((entry) =>
    entry.paths.some(
      (prefix) => repoRelativePath === prefix || repoRelativePath.startsWith(`${prefix}/`),
    ),
  )
}

function collectProductionSources(rootAbsolute: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(rootAbsolute, { withFileTypes: true })) {
    const full = join(rootAbsolute, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__snapshots__') continue
      collectProductionSources(full, acc)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue
    if (TEST_FILE.test(entry.name)) continue
    acc.push(full)
  }
  return acc
}

export type FormValidationEnforcementViolation = {
  file: string
  ruleId: string
}

export function scanFormValidationEnforcement(repoRoot = repoRootFromDashboard()): {
  violations: FormValidationEnforcementViolation[]
} {
  const violations: FormValidationEnforcementViolation[] = []

  for (const root of FORM_VALIDATION_ENFORCEMENT_ROOTS) {
    const absoluteRoot = join(repoRoot, root)
    if (!statSync(absoluteRoot).isDirectory()) continue

    for (const file of collectProductionSources(absoluteRoot)) {
      const repoRelative = relative(repoRoot, file).split('\\').join('/')
      if (isAllowlisted(repoRelative)) continue
      if (FORM_VALIDATION_RULE_EXEMPT_FILES.has(repoRelative)) continue

      const source = readFileSync(file, 'utf8')
      for (const rule of FORM_VALIDATION_LEGACY_RULES) {
        if (rule.pattern.test(source)) {
          violations.push({ file: repoRelative, ruleId: rule.id })
        }
      }
    }
  }

  return { violations }
}
