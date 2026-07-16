/**
 * Regenerates docs/analysis/spell-modeling-inventory.generated.md from seed metadata.
 * Run from repo root: pnpm exec tsx packages/catalog/scripts/generate-spell-modeling-report.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildSpellModelingAudit,
  generateSpellModelingReport,
  spellModelingAuditViolations,
} from '../src/spells/spell-modeling-audit.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '../../../docs/analysis/spell-modeling-inventory.generated.md')

const audit = buildSpellModelingAudit('srd-cc-5.2.1')
const violations = spellModelingAuditViolations(audit)

if (violations.length > 0) {
  console.error(`Spell modeling audit found ${violations.length} violation(s):`)
  for (const violation of violations) {
    console.error(`  ${violation.slug}: ${violation.code} — ${violation.message}`)
  }
  process.exit(1)
}

writeFileSync(outputPath, generateSpellModelingReport(audit), 'utf8')
console.log(`Wrote ${outputPath}`)
