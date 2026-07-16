import type { ModelingGapEntry } from '@rpg/contracts'

import type { SpellModelingAudit } from './spell-modeling-audit'

function formatGapList(gaps: readonly ModelingGapEntry[]): string {
  return gaps.map((gap) => gap.code).join(', ') || '—'
}

function appendStatusSummary(lines: string[], audit: SpellModelingAudit): void {
  lines.push('## Status summary', '')
  for (const [status, slugs] of Object.entries(audit.byEffectiveStatus)) {
    lines.push(`- **${status}**: ${slugs.length}`)
  }
}

function appendInventoryTable(lines: string[], audit: SpellModelingAudit): void {
  lines.push('', '## Per-spell inventory', '')
  lines.push(
    '| Spell | Reviewed | Effective status | Blocked from | Blocker | Capability | Residual gaps | Resolution |',
  )
  lines.push(
    '| ----- | -------- | ---------------- | ------------ | ------- | ---------- | ------------- | ---------- |',
  )

  for (const entry of audit.entries) {
    lines.push(
      `| ${entry.slug} | ${entry.reviewed ? 'yes' : 'no'} | ${entry.effectiveStatus} | ${entry.blockedFrom ?? '—'} | ${entry.blocker?.code ?? '—'} | ${entry.blocker?.capabilityId ?? '—'} | ${formatGapList(entry.gaps)} | ${entry.hasResolution ? 'yes' : 'no'} |`,
    )
  }
}

function appendViolations(lines: string[], audit: SpellModelingAudit): void {
  if (audit.violationCount === 0) return
  lines.push('', '## Violations', '')
  for (const violation of audit.entries.flatMap((entry) => entry.violations)) {
    lines.push(`- \`${violation.slug}\` — **${violation.code}**: ${violation.message}`)
  }
}

/** Markdown inventory for owners — generated from seeds, not hand-maintained tables. */
export function generateSpellModelingReport(audit: SpellModelingAudit): string {
  const lines = [
    '# Spell modeling inventory (generated)',
    '',
    `Ruleset: \`${audit.rulesetId}\``,
    `Total spells: ${audit.totalSpells}`,
    `Unreviewed: ${audit.unreviewed.length}`,
    `Prose-only without documented blocker: ${audit.proseOnlyWithoutDocumentedBlocker.length}`,
    `Violations: ${audit.violationCount}`,
    '',
  ]

  appendStatusSummary(lines, audit)
  appendInventoryTable(lines, audit)
  appendViolations(lines, audit)
  lines.push('')
  return lines.join('\n')
}
