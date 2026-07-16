/**
 * Spell modeling audit — operational inventory from seed `modeling` metadata.
 *
 * Replaces ad-hoc coverage inventories and slug maps. Reports effective status,
 * review state, gaps, and consistency violations for CI and generated docs.
 */
import {
  contentModelingSchema,
  deriveSpellModelingStatus,
  effectiveSpellModelingStatus,
  hasLegacySpellRootEffects,
  hasStructuredSpellResolution,
  isEditorEligible,
  isExplicitModelingStatus,
  isSpellModelingGapCode,
  isSpellModelingReviewed,
  meetsConsumerThreshold,
  type ExplicitModelingStatus,
  type ModelingGapEntry,
  type ModelingStatus,
  type Spell,
  type SystemRulesetId,
  validateSpellModelingPromotion,
} from '@rpg/contracts'

import { loadSeedSpells } from './index'

export type SpellModelingViolation = {
  slug: string
  code: string
  message: string
}

export type SpellModelingAuditEntry = {
  slug: string
  reviewed: boolean
  effectiveStatus: ModelingStatus
  explicitStatus?: ExplicitModelingStatus
  gaps: readonly ModelingGapEntry[]
  hasResolution: boolean
  hasLegacyEffects: boolean
  editorEligible: boolean
  displayReady: boolean
  violations: SpellModelingViolation[]
}

export type SpellModelingAudit = {
  rulesetId: SystemRulesetId
  totalSpells: number
  entries: SpellModelingAuditEntry[]
  byEffectiveStatus: Record<ModelingStatus, string[]>
  unreviewed: string[]
  violationCount: number
}

function toViolation(slug: string, code: string, message: string): SpellModelingViolation {
  return { slug, code, message }
}

/** Validates modeling metadata shape and consistency for one spell. */
export function validateSpellModelingConsistency(spell: Spell): SpellModelingViolation[] {
  const violations: SpellModelingViolation[] = []

  if (!spell.modeling) return violations

  const parsed = contentModelingSchema.safeParse(spell.modeling)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      violations.push(toViolation(spell.slug, 'invalid-modeling-schema', issue.message))
    }
    return violations
  }

  const modeling = parsed.data

  if (modeling.status && !isExplicitModelingStatus(modeling.status)) {
    violations.push(
      toViolation(
        spell.slug,
        'invalid-explicit-status',
        `Status must be one of: meaningful-partial, sufficient-for-display, sufficient-for-character-sheet, mechanics-ready`,
      ),
    )
  }

  for (const gap of modeling.gaps ?? []) {
    if (!isSpellModelingGapCode(gap.code)) {
      violations.push(
        toViolation(spell.slug, 'unknown-gap-code', `Unknown modeling gap code: ${gap.code}`),
      )
    }
  }

  for (const issue of validateSpellModelingPromotion(spell)) {
    violations.push(toViolation(spell.slug, issue.code, issue.message))
  }

  return violations
}

function toAuditEntry(spell: Spell): SpellModelingAuditEntry {
  const effectiveStatus = effectiveSpellModelingStatus(spell)
  const violations = validateSpellModelingConsistency(spell)

  return {
    slug: spell.slug,
    reviewed: isSpellModelingReviewed(spell.modeling),
    effectiveStatus,
    explicitStatus: spell.modeling?.status,
    gaps: spell.modeling?.gaps ?? [],
    hasResolution: hasStructuredSpellResolution(spell),
    hasLegacyEffects: hasLegacySpellRootEffects(spell),
    editorEligible: isEditorEligible(effectiveStatus),
    displayReady: meetsConsumerThreshold(effectiveStatus, 'sufficient-for-display'),
    violations,
  }
}

function groupByEffectiveStatus(
  entries: SpellModelingAuditEntry[],
): Record<ModelingStatus, string[]> {
  const groups: Record<ModelingStatus, string[]> = {
    'prose-only': [],
    'non-meaningful-partial': [],
    'meaningful-partial': [],
    'sufficient-for-display': [],
    'sufficient-for-character-sheet': [],
    'mechanics-ready': [],
  }

  for (const entry of entries) {
    groups[entry.effectiveStatus].push(entry.slug)
  }

  for (const status of Object.keys(groups) as ModelingStatus[]) {
    groups[status].sort()
  }

  return groups
}

/** Audits spell modeling metadata for a ruleset seed catalog. */
export function buildSpellModelingAudit(rulesetId: SystemRulesetId): SpellModelingAudit {
  const entries = loadSeedSpells(rulesetId).map(toAuditEntry)
  const violationCount = entries.reduce((sum, entry) => sum + entry.violations.length, 0)

  return {
    rulesetId,
    totalSpells: entries.length,
    entries,
    byEffectiveStatus: groupByEffectiveStatus(entries),
    unreviewed: entries
      .filter((entry) => !entry.reviewed)
      .map((entry) => entry.slug)
      .sort(),
    violationCount,
  }
}

export function spellModelingAuditViolations(audit: SpellModelingAudit): SpellModelingViolation[] {
  return audit.entries.flatMap((entry) => entry.violations)
}

/** Markdown inventory for owners — generated from seeds, not hand-maintained tables. */
export function generateSpellModelingReport(audit: SpellModelingAudit): string {
  const lines: string[] = [
    '# Spell modeling inventory (generated)',
    '',
    `Ruleset: \`${audit.rulesetId}\``,
    `Total spells: ${audit.totalSpells}`,
    `Unreviewed: ${audit.unreviewed.length}`,
    `Violations: ${audit.violationCount}`,
    '',
    '## Status summary',
    '',
  ]

  for (const [status, slugs] of Object.entries(audit.byEffectiveStatus)) {
    lines.push(`- **${status}**: ${slugs.length}`)
  }

  lines.push('', '## Per-spell inventory', '')
  lines.push(
    '| Spell | Reviewed | Effective status | Explicit status | Gaps | Resolution | Legacy effects |',
  )
  lines.push(
    '| ----- | -------- | ---------------- | --------------- | ---- | ---------- | -------------- |',
  )

  for (const entry of audit.entries) {
    const gapCodes = entry.gaps.map((gap) => gap.code).join(', ') || '—'
    lines.push(
      `| ${entry.slug} | ${entry.reviewed ? 'yes' : 'no'} | ${entry.effectiveStatus} | ${entry.explicitStatus ?? '—'} | ${gapCodes} | ${entry.hasResolution ? 'yes' : 'no'} | ${entry.hasLegacyEffects ? 'yes' : 'no'} |`,
    )
  }

  if (audit.violationCount > 0) {
    lines.push('', '## Violations', '')
    for (const violation of spellModelingAuditViolations(audit)) {
      lines.push(`- \`${violation.slug}\` — **${violation.code}**: ${violation.message}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

export { deriveSpellModelingStatus }
