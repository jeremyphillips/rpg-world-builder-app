import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const DASHBOARD_SRC = fileURLToPath(new URL('../../../../../', import.meta.url))

const FORM_CONFIG_GLOBS = ['form-fields.ts', 'form-labels.ts', 'form-constants.ts'] as const

/** Paths relative to apps/dashboard/src that may keep hand-authored generic copy. */
const ALLOWLIST = new Set<string>([
  // Requirement editor condition picker uses a compact label without ellipsis.
  'features/content/feats/lib/requirement-editor-constants.ts',
  // Domain-specific combobox search placeholders — not closed-state choice copy.
  'features/content/lib/forms/organization-form-projection.ts',
  // Legitimate UI-selection mechanics (bulk parent picker dialog).
  'features/content/locations/lib/hierarchy/bulk/bulk-change-parent-labels.ts',
])

const FORBIDDEN_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'Select at least', pattern: /\bSelect at least\b/i },
  { label: 'Select up to', pattern: /\bSelect up to\b/i },
  { label: 'Please select', pattern: /\bPlease select\b/i },
  { label: 'Please choose', pattern: /\bPlease choose\b/i },
  { label: 'Select… placeholder', pattern: /placeholder:\s*['"]Select…['"]/ },
  { label: 'Select... placeholder', pattern: /placeholder:\s*['"]Select\.\.\.['"]/ },
  {
    label: 'Constraint-restating hint',
    pattern: /hint:\s*['"][^'"]*\b(?:Select|Choose) (?:at least|up to)\b/i,
  },
  { label: 'Pick as many as apply', pattern: /\bPick as many as apply\b/i },
]

function collectFormConfigFiles(directory: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFormConfigFiles(absolutePath, acc)
      continue
    }
    if (FORM_CONFIG_GLOBS.some((suffix) => entry.name.endsWith(suffix))) {
      acc.push(absolutePath)
    }
  }
  return acc
}

describe('field copy drift guard', () => {
  it('form config modules avoid generic hand-authored choice copy', () => {
    const files = collectFormConfigFiles(DASHBOARD_SRC)
    const violations: string[] = []

    for (const filePath of files) {
      const relativePath = relative(DASHBOARD_SRC, filePath)
      if (ALLOWLIST.has(relativePath)) continue

      const contents = readFileSync(filePath, 'utf8')
      for (const { label, pattern } of FORBIDDEN_PATTERNS) {
        if (pattern.test(contents)) {
          violations.push(`${relativePath} (${label})`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})
